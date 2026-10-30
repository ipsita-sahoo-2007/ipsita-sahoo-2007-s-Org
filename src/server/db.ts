import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, InspectionProfile, Inspection } from './types.js';

interface DatabaseData {
  users: User[];
  inspection_profiles: InspectionProfile[];
  inspections: Inspection[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'visionguard.json');

import { SAMPLE_ASSETS } from '../constants/assets.js';
export { SAMPLE_ASSETS };

function ensureDb(): DatabaseData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading db file, reinitializing', e);
    }
  }

  // Seed default data
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const inspectorId = 'u-001-inspector';
  const adminId = 'u-002-admin';

  const initialUsers: User[] = [
    {
      id: inspectorId,
      name: 'Sarah Jenkins',
      email: 'inspector@visionguard.ai',
      password_hash: defaultPasswordHash,
      role: 'inspector',
      avatar_url: SAMPLE_ASSETS.avatar,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: adminId,
      name: 'Marcus Vance',
      email: 'admin@visionguard.ai',
      password_hash: defaultPasswordHash,
      role: 'admin',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const initialProfiles: InspectionProfile[] = [
    {
      id: 'prof-mfg-01',
      user_id: inspectorId,
      name: 'Aerospace Precision Alloy Tolerance',
      domain: 'manufacturing',
      description: 'Zero-tolerance surface micro-crack and cooling hole dimensional verification',
      custom_rules: {
        sensitivity: 'ultra',
        focus_areas: ['Trailing edge micro-fissures', 'Cooling duct occlusion', 'Thermal barrier coating loss'],
        min_confidence: 85,
        require_remediation: true,
      },
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'prof-safe-02',
      user_id: inspectorId,
      name: 'OSHA High-Elevation Steel Protocol',
      domain: 'safety',
      description: 'Strict mandatory detection of 100% tie-off harnesses, hardhats, and hi-vis garments',
      custom_rules: {
        sensitivity: 'high',
        focus_areas: ['Double lanyard harness connection', 'Chin-strap retention', 'Non-certified footwear'],
        min_confidence: 75,
        require_remediation: true,
      },
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'prof-infra-03',
      user_id: inspectorId,
      name: 'Substructure Concrete & Rebar Fatigue',
      domain: 'infrastructure',
      description: 'AASHTO highway bridge pillar structural cracking and ferric oxidation tracking',
      custom_rules: {
        sensitivity: 'high',
        focus_areas: ['Diagonal shear cracks > 0.3mm', 'Spalling rebar exposure', 'Efflorescence leaching'],
        min_confidence: 80,
        require_remediation: true,
      },
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'prof-doc-04',
      user_id: inspectorId,
      name: 'Cryptographic Credential & Seal Tampering',
      domain: 'document',
      description: 'Microline pattern continuity, hologram diffraction alignment, and optical character parity',
      custom_rules: {
        sensitivity: 'ultra',
        focus_areas: ['Ghost photo optical alignment', 'Seal overlay microprint', 'Font kerning manipulation'],
        min_confidence: 90,
        require_remediation: true,
      },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  const initialInspections: Inspection[] = [
    {
      id: 'insp-001-mfg',
      user_id: inspectorId,
      title: 'TB-407 High-Pressure Turbine Stage 1 Blade',
      domain: 'manufacturing',
      image_url: SAMPLE_ASSETS.manufacturing,
      status: 'WARNING',
      severity: 'medium',
      overall_score: 87.5,
      priority: 'high',
      notes: 'Evaluate laser cooling hole uniformity and root serration alignment under high-precision optical probe.',
      anomalies_detected: [
        {
          id: 'anom-1',
          title: 'Sub-millimeter Root Serration Burr',
          description: 'Micro-burr detected along the lower dovetail mounting root at Rev G datum.',
          confidence: 92,
          severity: 'medium',
          boundingBox: { ymin: 68, xmin: 38, ymax: 76, xmax: 60 },
        },
        {
          id: 'anom-2',
          title: 'Cooling Duct Boundary Variance',
          description: 'Slight acoustic laser drilled hole diameter fluctuation exceeding 0.003mm tolerance threshold.',
          confidence: 88,
          severity: 'low',
          boundingBox: { ymin: 24, xmin: 55, ymax: 56, xmax: 63 },
        },
      ],
      recommendations: [
        'Route part to deburring station B-4 for ultrasonic micro-finish treatment.',
        'Perform CMM coordinate re-measurement before hot section turbine disc assembly.',
      ],
      ai_raw_response: null,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'insp-002-safe',
      user_id: inspectorId,
      title: 'Sector 4B Steel Girder Erection Crew Audit',
      domain: 'safety',
      image_url: SAMPLE_ASSETS.safety,
      status: 'PASSED',
      severity: 'low',
      overall_score: 98.2,
      priority: 'medium',
      notes: 'Routine overhead girder assembly inspection. Verify PPE and tie-offs.',
      anomalies_detected: [],
      recommendations: [
        'All personnel verified wearing Class 2 high-visibility vests and ANSI-rated hardhats.',
        'Harness anchor points confirmed secure. Maintain 100% continuous tie-off during girder transit.',
      ],
      ai_raw_response: null,
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'insp-003-infra',
      user_id: inspectorId,
      title: 'Pier 7 South River Bridge Concrete Spalling Assessment',
      domain: 'infrastructure',
      image_url: SAMPLE_ASSETS.infrastructure,
      status: 'FAILED',
      severity: 'critical',
      overall_score: 42.0,
      priority: 'critical',
      notes: 'Noticeable vertical shear fracture and iron oxide leaching detected during low tide inspection.',
      anomalies_detected: [
        {
          id: 'anom-3',
          title: 'Structural Concrete Spalling & Exposed Rebar',
          description: 'Severe vertical fracture (width > 3.5mm) with deep corrosion on internal reinforcing steel rebar.',
          confidence: 96,
          severity: 'critical',
          boundingBox: { ymin: 21, xmin: 26, ymax: 78, xmax: 58 },
        },
        {
          id: 'anom-4',
          title: 'Active Rust Efflorescence & Moisture Penetration',
          description: 'Severe rust staining indicating active hydraulic migration through pier core matrix.',
          confidence: 94,
          severity: 'high',
          boundingBox: { ymin: 44, xmin: 42, ymax: 67, xmax: 60 },
        },
      ],
      recommendations: [
        'Issue immediate structural warning to Regional Transit Authority for Pier 7.',
        'Schedule emergency hydro-demolition and epoxy structural re-grouting within 72 hours.',
        'Deploy ultrasonic acoustic wave testing to verify internal core integrity.',
      ],
      ai_raw_response: null,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'insp-004-doc',
      user_id: inspectorId,
      title: 'Global Secure Solutions Protocol Badge Verification',
      domain: 'document',
      image_url: SAMPLE_ASSETS.document,
      status: 'PASSED',
      severity: 'low',
      overall_score: 96.8,
      priority: 'medium',
      notes: 'Automated badge intake scan. Hologram optical diffraction and microprint authenticity check.',
      anomalies_detected: [
        {
          id: 'anom-5',
          title: 'Minor Microline Resolution Softness',
          description: 'Lower peripheral barcode edge displays slight scanner optical diffraction softness.',
          confidence: 76,
          severity: 'low',
          boundingBox: { ymin: 63, xmin: 18, ymax: 69, xmax: 35 },
        },
      ],
      recommendations: [
        'Holographic security medallion matches Level IV clearance registry specification.',
        'Serial and barcode telemetry decoded successfully. Clearance token granted.',
      ],
      ai_raw_response: null,
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
  ];

  const initialDb: DatabaseData = {
    users: initialUsers,
    inspection_profiles: initialProfiles,
    inspections: initialInspections,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db = ensureDb();

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export const dbService = {
  // Users
  getUserByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },

  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb();
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    return db.users[index];
  },

  // Inspections
  getInspections(options: {
    userId?: string;
    isAdmin?: boolean;
    domain?: string;
    status?: string;
    severity?: string;
    search?: string;
  }): Inspection[] {
    let list = db.inspections;

    // RLS: non-admins only see their own records
    if (!options.isAdmin && options.userId) {
      list = list.filter((i) => i.user_id === options.userId);
    }

    if (options.domain && options.domain !== 'all') {
      list = list.filter((i) => i.domain === options.domain);
    }

    if (options.status && options.status !== 'all') {
      list = list.filter((i) => i.status.toLowerCase() === options.status?.toLowerCase());
    }

    if (options.severity && options.severity !== 'all') {
      list = list.filter((i) => i.severity.toLowerCase() === options.severity?.toLowerCase());
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q) ||
          (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    // Sort descending by created_at
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getInspectionById(id: string, userId?: string, isAdmin?: boolean): Inspection | undefined {
    const item = db.inspections.find((i) => i.id === id);
    if (!item) return undefined;
    if (!isAdmin && userId && item.user_id !== userId) {
      return undefined; // RLS check
    }
    return item;
  },

  createInspection(data: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>): Inspection {
    const newInspection: Inspection = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.inspections.unshift(newInspection);
    saveDb();
    return newInspection;
  },

  updateInspection(id: string, updates: Partial<Inspection>): Inspection | undefined {
    const index = db.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    db.inspections[index] = {
      ...db.inspections[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    return db.inspections[index];
  },

  deleteInspection(id: string, userId?: string, isAdmin?: boolean): boolean {
    const index = db.inspections.findIndex((i) => i.id === id);
    if (index === -1) return false;
    if (!isAdmin && userId && db.inspections[index].user_id !== userId) {
      return false; // RLS violation
    }
    db.inspections.splice(index, 1);
    saveDb();
    return true;
  },

  // Profiles
  getProfiles(userId?: string, isAdmin?: boolean): InspectionProfile[] {
    let list = db.inspection_profiles;
    if (!isAdmin && userId) {
      list = list.filter((p) => p.user_id === userId);
    }
    return list;
  },

  getProfileById(id: string): InspectionProfile | undefined {
    return db.inspection_profiles.find((p) => p.id === id);
  },

  createProfile(data: Omit<InspectionProfile, 'id' | 'created_at'>): InspectionProfile {
    const newProfile: InspectionProfile = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
    };
    db.inspection_profiles.push(newProfile);
    saveDb();
    return newProfile;
  },

  deleteProfile(id: string, userId?: string, isAdmin?: boolean): boolean {
    const index = db.inspection_profiles.findIndex((p) => p.id === id);
    if (index === -1) return false;
    if (!isAdmin && userId && db.inspection_profiles[index].user_id !== userId) {
      return false;
    }
    db.inspection_profiles.splice(index, 1);
    saveDb();
    return true;
  },

  // Analytics
  getAnalyticsSummary(userId?: string, isAdmin?: boolean) {
    let list = db.inspections;
    if (!isAdmin && userId) {
      list = list.filter((i) => i.user_id === userId);
    }

    const total = list.length;
    const passed = list.filter((i) => i.status === 'PASSED').length;
    const failed = list.filter((i) => i.status === 'FAILED').length;
    const warning = list.filter((i) => i.status === 'WARNING').length;
    const totalScore = list.reduce((acc, curr) => acc + (Number(curr.overall_score) || 0), 0);
    const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;
    const totalAnomalies = list.reduce((acc, curr) => acc + (curr.anomalies_detected?.length || 0), 0);

    const domainBreakdown = {
      manufacturing: list.filter((i) => i.domain === 'manufacturing').length,
      safety: list.filter((i) => i.domain === 'safety').length,
      infrastructure: list.filter((i) => i.domain === 'infrastructure').length,
      document: list.filter((i) => i.domain === 'document').length,
    };

    const severityBreakdown = {
      critical: list.filter((i) => i.severity === 'critical').length,
      high: list.filter((i) => i.severity === 'high').length,
      medium: list.filter((i) => i.severity === 'medium').length,
      low: list.filter((i) => i.severity === 'low').length,
    };

    return {
      total,
      passed,
      failed,
      warning,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      avgScore,
      totalAnomalies,
      avgProcessingTimeSec: 1.4,
      domainBreakdown,
      severityBreakdown,
      recentActivity: list.slice(0, 5),
    };
  },
};
