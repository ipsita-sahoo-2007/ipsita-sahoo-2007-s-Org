import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import { dbService, SAMPLE_ASSETS } from './src/server/db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest, JWT_SECRET } from './src/server/middleware/auth.js';
import { registerSchema, loginSchema, createInspectionSchema, createProfileSchema } from './src/server/schemas.js';
import { analyzeVisualAsset } from './src/server/gemini.js';
import { InspectionDomain, SeverityLevel } from './src/server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for uploaded files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Serve assets folder statically
app.use('/src/assets', express.static(path.join(__dirname, 'src/assets')));

// Helper: generate JWT
function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

// -------------------------------------------------------------
// Authentication Routes
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0]?.message || 'Validation failed' });
  }

  const { name, email, password, role } = result.data;
  const existing = dbService.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const newUser = dbService.createUser({
    name,
    email,
    password_hash,
    role,
    avatar_url: SAMPLE_ASSETS.avatar,
  });

  const token = generateToken(newUser);
  const { password_hash: _, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, token });
});

app.post('/api/auth/login', (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0]?.message || 'Invalid input' });
  }

  const { email, password } = result.data;
  const user = dbService.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  const { password_hash: _, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { password_hash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// -------------------------------------------------------------
// Inspection Routes
// -------------------------------------------------------------

// List inspections
app.get('/api/inspections', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const { domain, status, severity, search } = req.query;

  const list = dbService.getInspections({
    userId,
    isAdmin,
    domain: domain as string,
    status: status as string,
    severity: severity as string,
    search: search as string,
  });

  return res.json({ inspections: list });
});

// Single inspection detail
app.get('/api/inspections/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

  const item = dbService.getInspectionById(id, userId, isAdmin);
  if (!item) {
    return res.status(404).json({ error: 'Inspection report not found or access restricted' });
  }

  return res.json({ inspection: item });
});

// Create and trigger AI inspection
app.post('/api/inspections', optionalAuth, upload.single('image'), async (req: AuthenticatedRequest, res) => {
  try {
    // If user is not logged in, default to the seeded inspector account so guests can inspect immediately!
    const effectiveUser = req.user || dbService.getUserByEmail('inspector@visionguard.ai') || {
      id: 'default-user',
      name: 'Senior Inspector',
      email: 'inspector@visionguard.ai',
      role: 'inspector' as const,
      password_hash: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const parsed = createInspectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation error' });
    }

    const { title, domain, priority, notes, profileId } = parsed.data;

    let imageBase64 = '';
    let mimeType = 'image/jpeg';
    let imageUrl = req.body.imageUrl || '';

    // Handle file upload vs imageUrl / base64 payload
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
      imageUrl = `data:${mimeType};base64,${imageBase64}`;
    } else if (req.body.imageBase64) {
      imageBase64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      mimeType = req.body.mimeType || 'image/jpeg';
      imageUrl = req.body.imageBase64.startsWith('data:')
        ? req.body.imageBase64
        : `data:${mimeType};base64,${imageBase64}`;
    } else if (imageUrl) {
      // Check if it is a local asset path
      if (imageUrl.startsWith('/src/assets/images/') || imageUrl.startsWith('src/assets/images/')) {
        const localPath = path.join(__dirname, imageUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          const buffer = fs.readFileSync(localPath);
          imageBase64 = buffer.toString('base64');
          mimeType = localPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        }
      }
    }

    // Fallback image if none provided
    if (!imageBase64) {
      const defaultSample = SAMPLE_ASSETS[domain as InspectionDomain] || SAMPLE_ASSETS.manufacturing;
      imageUrl = defaultSample;
      const localPath = path.join(__dirname, defaultSample.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        imageBase64 = buffer.toString('base64');
        mimeType = 'image/jpeg';
      }
    }

    // Look up custom profile rules if specified
    let customRulesPrompt = '';
    if (profileId) {
      const profile = dbService.getProfileById(profileId);
      if (profile) {
        customRulesPrompt = `${profile.name}: ${profile.description}. Focus areas: ${profile.custom_rules?.focus_areas?.join(', ')}`;
      }
    }

    // Execute Multi-Modal AI Inspection using Gemini 3.8 Flash
    const aiResult = await analyzeVisualAsset({
      imageBase64,
      mimeType,
      domain: domain as InspectionDomain,
      title,
      priority: priority as SeverityLevel,
      notes,
      customRulesPrompt,
    });

    // Persist to Database
    const inspection = dbService.createInspection({
      user_id: effectiveUser.id,
      title,
      domain: domain as InspectionDomain,
      image_url: imageUrl,
      status: aiResult.status,
      severity: aiResult.severity,
      overall_score: aiResult.overallScore,
      priority: (priority as SeverityLevel) || 'medium',
      notes,
      ai_raw_response: aiResult,
      anomalies_detected: aiResult.anomalies.map((a, idx) => ({
        id: `anom-${Date.now()}-${idx + 1}`,
        title: a.title,
        description: a.description,
        confidence: a.confidence,
        severity: aiResult.severity,
        boundingBox: a.boundingBox,
      })),
      recommendations: aiResult.recommendations,
    });

    return res.status(201).json({ inspection });
  } catch (err: any) {
    console.error('Inspection creation error:', err);
    return res.status(500).json({ error: err.message || 'Internal inspection processing failure' });
  }
});

// Reanalyze inspection
app.post('/api/inspections/:id/reanalyze', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

  const item = dbService.getInspectionById(id, userId, isAdmin);
  if (!item) {
    return res.status(404).json({ error: 'Inspection report not found' });
  }

  try {
    let imageBase64 = '';
    let mimeType = 'image/jpeg';

    if (item.image_url.startsWith('data:')) {
      const match = item.image_url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBase64 = match[2];
      }
    } else if (item.image_url.startsWith('/src/assets/images/') || item.image_url.startsWith('src/assets/images/')) {
      const localPath = path.join(__dirname, item.image_url.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        imageBase64 = buffer.toString('base64');
      }
    }

    const aiResult = await analyzeVisualAsset({
      imageBase64,
      mimeType,
      domain: item.domain,
      title: item.title,
      priority: item.priority,
      notes: req.body.notes || item.notes,
    });

    const updated = dbService.updateInspection(id, {
      status: aiResult.status,
      severity: aiResult.severity,
      overall_score: aiResult.overallScore,
      notes: req.body.notes || item.notes,
      ai_raw_response: aiResult,
      anomalies_detected: aiResult.anomalies.map((a, idx) => ({
        id: `anom-${Date.now()}-${idx + 1}`,
        title: a.title,
        description: a.description,
        confidence: a.confidence,
        severity: aiResult.severity,
        boundingBox: a.boundingBox,
      })),
      recommendations: aiResult.recommendations,
    });

    return res.json({ inspection: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to re-analyze visual asset' });
  }
});

// Delete inspection
app.delete('/api/inspections/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

  const success = dbService.deleteInspection(id, userId, isAdmin);
  if (!success) {
    return res.status(404).json({ error: 'Inspection not found or permission denied' });
  }

  return res.json({ success: true, message: 'Inspection record deleted' });
});

// -------------------------------------------------------------
// Profiles Routes
// -------------------------------------------------------------

app.get('/api/profiles', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const profiles = dbService.getProfiles(userId, isAdmin);
  return res.json({ profiles });
});

app.post('/api/profiles', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'u-001-inspector';
  const parsed = createProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
  }

  const newProfile = dbService.createProfile({
    user_id: userId,
    name: parsed.data.name,
    domain: parsed.data.domain as InspectionDomain,
    description: parsed.data.description,
    custom_rules: parsed.data.custom_rules,
  });

  return res.status(201).json({ profile: newProfile });
});

app.delete('/api/profiles/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

  const success = dbService.deleteProfile(id, userId, isAdmin);
  if (!success) {
    return res.status(404).json({ error: 'Profile not found or permission denied' });
  }

  return res.json({ success: true });
});

// -------------------------------------------------------------
// Analytics & Sample Asset Routes
// -------------------------------------------------------------

app.get('/api/analytics/summary', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  const summary = dbService.getAnalyticsSummary(userId, isAdmin);
  return res.json({ summary });
});

app.get('/api/sample-assets', (_req, res) => {
  return res.json({
    assets: [
      {
        domain: 'manufacturing',
        title: 'Precision Aerospace Turbine Blade Stage 1',
        url: SAMPLE_ASSETS.manufacturing,
        description: 'Titanium-alloy high-pressure blade with laser-drilled cooling vents',
        focus: 'Surface micro-fractures, burrs, hole occlusions',
      },
      {
        domain: 'safety',
        title: 'High-Elevation Structural Steel Ironworkers',
        url: SAMPLE_ASSETS.safety,
        description: 'Active girder assembly crew at industrial chemical processing plant',
        focus: 'Hardhats, Class 2 hi-vis vests, continuous harness tie-offs',
      },
      {
        domain: 'infrastructure',
        title: 'Highway Overpass Concrete Substructure Pier',
        url: SAMPLE_ASSETS.infrastructure,
        description: 'Weathered reinforced concrete column over river channel',
        focus: 'Shear fissure cracking, rebar spalling, iron oxide weeping',
      },
      {
        domain: 'document',
        title: 'Level IV Security Credential & Clearance Protocol',
        url: SAMPLE_ASSETS.document,
        description: 'High-security identification document with holographic watermark',
        focus: 'Diffraction seal integrity, microprint alignment, font tampering',
      },
    ],
  });
});

// -------------------------------------------------------------
// Vite Dev Server / Static Production Server
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`VisionGuard AI server operating on http://0.0.0.0:${PORT}`);
  });
}

startServer();
