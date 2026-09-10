/**
 * Danh sach Job Role trong mot team ky thuat.
 * Dung de hien thi badge, chip, va loc thanh vien.
 */
export interface JobRole {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const JOB_ROLES: JobRole[] = [
  { id: 'PM',          label: 'PM',        color: '#7c3aed', bgColor: '#ede9fe', icon: 'manage_accounts' },
  { id: 'BA',          label: 'BA',        color: '#0d9488', bgColor: '#ccfbf1', icon: 'analytics'       },
  { id: 'FE',          label: 'Frontend',  color: '#1d4ed8', bgColor: '#dbeafe', icon: 'web'             },
  { id: 'BE',          label: 'Backend',   color: '#047857', bgColor: '#d1fae5', icon: 'dns'             },
  { id: 'QA',          label: 'QA/QC',     color: '#b45309', bgColor: '#fef3c7', icon: 'bug_report'      },
  { id: 'DevOps',      label: 'DevOps',    color: '#b91c1c', bgColor: '#fee2e2', icon: 'terminal'        },
  { id: 'Designer',    label: 'Designer',  color: '#be185d', bgColor: '#fce7f3', icon: 'palette'         },
  { id: 'Mobile',      label: 'Mobile',    color: '#0e7490', bgColor: '#cffafe', icon: 'smartphone'      },
  { id: 'DataAnalyst', label: 'Data',      color: '#c2410c', bgColor: '#ffedd5', icon: 'bar_chart'       },
  { id: 'Other',       label: 'Khac',      color: '#374151', bgColor: '#f3f4f6', icon: 'person'          },
];

/**
 * Tra cuu nhanh thong tin 1 JobRole theo id
 */
export function getJobRole(id: string | null | undefined): JobRole | undefined {
  return JOB_ROLES.find(r => r.id === id);
}