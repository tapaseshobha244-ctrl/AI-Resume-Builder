type ResumeData = {
  personalInfo?: {
    fullName?: string; email?: string; phone?: string; location?: string;
    linkedin?: string | null; github?: string | null; portfolio?: string | null; summary?: string | null;
  };
  education?: Array<{ degree?: string; college?: string; year?: string; cgpa?: string | null }>;
  technicalSkills?: string[];
  softSkills?: string[];
  tools?: string[];
  projects?: Array<{ name?: string; description?: string; technologies?: string; githubLink?: string | null }>;
  experience?: Array<{ company?: string; role?: string; duration?: string; responsibilities?: string }>;
  internships?: Array<{ company?: string; role?: string; duration?: string; details?: string | null }>;
  certifications?: Array<{ name?: string; issuer?: string | null; year?: string | null }>;
  achievements?: Array<{ title?: string; description?: string | null }>;
  targetRole?: string | null;
};

const S = {
  page: { backgroundColor: "#fff", color: "#1c1c1c", fontFamily: "Calibri, Arial, sans-serif", fontSize: "11px", lineHeight: "1.5", width: "100%", minHeight: "1056px", padding: "0" } as React.CSSProperties,
  header: { backgroundColor: "#1a2744", color: "#fff", padding: "32px 48px 24px" } as React.CSSProperties,
  name: { fontSize: "26px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "6px" },
  role: { fontSize: "12px", color: "#8fafd0", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: "10px" },
  contactRow: { display: "flex", flexWrap: "wrap" as const, gap: "0 24px", fontSize: "9.5px", color: "#b8cce0" },
  body: { padding: "28px 48px" } as React.CSSProperties,
  section: { marginBottom: "18px" } as React.CSSProperties,
  sectionTitle: { fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" as const, color: "#1a2744", borderBottom: "2px solid #1a2744", paddingBottom: "3px", marginBottom: "10px" },
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } as React.CSSProperties,
  jobRole: { fontWeight: "700", fontSize: "11.5px" } as React.CSSProperties,
  jobDate: { fontSize: "10px", color: "#666", whiteSpace: "nowrap" as const },
  jobCompany: { color: "#2a5298", fontWeight: "600", fontSize: "10.5px", marginBottom: "3px" },
  jobDesc: { color: "#444", marginTop: "4px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" } as React.CSSProperties,
  skillList: { color: "#444", lineHeight: "1.8" },
};

export function Executive({ data }: { data: ResumeData }) {
  const p = data.personalInfo ?? {};
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean);
  const techSkills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])].filter(Boolean);
  const hasCerts = (data.certifications ?? []).filter(c => c.name).length > 0;
  const hasAch = (data.achievements ?? []).filter(a => a.title).length > 0;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.name}>{p.fullName || "Your Name"}</div>
        {data.targetRole && <div style={S.role}>{data.targetRole}</div>}
        {contacts.length > 0 && (
          <div style={S.contactRow}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Summary */}
        {p.summary && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Executive Summary</div>
            <p style={{ color: "#333", fontStyle: "italic" }}>{p.summary}</p>
          </div>
        )}

        {/* Experience */}
        {(data.experience ?? []).filter(e => e.company).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Professional Experience</div>
            {data.experience!.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={S.jobHeader}>
                  <span style={S.jobRole}>{e.role}</span>
                  <span style={S.jobDate}>{e.duration}</span>
                </div>
                <div style={S.jobCompany}>{e.company}</div>
                {e.responsibilities && <p style={S.jobDesc}>{e.responsibilities}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Internships */}
        {(data.internships ?? []).filter(e => e.company).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Internships</div>
            {data.internships!.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={S.jobHeader}>
                  <span style={S.jobRole}>{e.role}</span>
                  <span style={S.jobDate}>{e.duration}</span>
                </div>
                <div style={S.jobCompany}>{e.company}</div>
                {e.details && <p style={S.jobDesc}>{e.details}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {techSkills.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Core Competencies & Technical Skills</div>
            <div style={S.twoCol}>
              <div style={S.skillList}>{techSkills.join("  ·  ")}</div>
              {(data.softSkills ?? []).filter(Boolean).length > 0 && (
                <div style={{ color: "#666" }}>
                  <span style={{ fontWeight: "600", color: "#444" }}>Soft Skills: </span>
                  {data.softSkills!.filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {(data.projects ?? []).filter(p => p.name).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Key Projects</div>
            {data.projects!.filter(p => p.name).map((pr, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "700" }}>{pr.name}</span>
                {pr.technologies && <span style={{ color: "#555" }}> | {pr.technologies}</span>}
                {pr.description && <p style={{ color: "#444", marginTop: "2px" }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {(data.education ?? []).filter(e => e.degree).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Education</div>
            {data.education!.filter(e => e.degree).map((ed, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={S.jobHeader}>
                  <span style={{ fontWeight: "700" }}>{ed.degree}</span>
                  <span style={S.jobDate}>{ed.year}</span>
                </div>
                <div style={{ color: "#555" }}>{ed.college}{ed.cgpa ? ` · CGPA: ${ed.cgpa}` : ""}</div>
              </div>
            ))}
          </div>
        )}

        {/* Certs + Achievements side-by-side */}
        {(hasCerts || hasAch) && (
          <div style={S.twoCol}>
            {hasCerts && (
              <div style={S.section}>
                <div style={S.sectionTitle}>Certifications</div>
                {data.certifications!.filter(c => c.name).map((c, i) => (
                  <div key={i} style={{ marginBottom: "4px", color: "#444" }}>
                    <span style={{ fontWeight: "600" }}>{c.name}</span>
                    {c.issuer ? `, ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}
                  </div>
                ))}
              </div>
            )}
            {hasAch && (
              <div style={S.section}>
                <div style={S.sectionTitle}>Achievements</div>
                {data.achievements!.filter(a => a.title).map((a, i) => (
                  <div key={i} style={{ marginBottom: "4px", color: "#444" }}>
                    <span style={{ fontWeight: "600" }}>{a.title}</span>
                    {a.description ? ` — ${a.description}` : ""}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
