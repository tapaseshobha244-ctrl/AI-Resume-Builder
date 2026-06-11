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

const MINT = "#0e9f6e";
const MINT_DARK = "#057a55";
const MINT_LIGHT = "#d1fae5";
const SIDEBAR_BG = "#0a3d2e";

const S = {
  page: { backgroundColor: "#fff", color: "#1c1c1c", fontFamily: "Arial, sans-serif", fontSize: "10.5px", lineHeight: "1.55", width: "100%", minHeight: "1056px", display: "flex" } as React.CSSProperties,
  sidebar: { width: "205px", backgroundColor: SIDEBAR_BG, color: "#fff", padding: "32px 18px", display: "flex", flexDirection: "column" as const, gap: "20px", flexShrink: 0 } as React.CSSProperties,
  sidebarName: { fontSize: "17px", fontWeight: "700", lineHeight: "1.2", marginBottom: "4px", color: "#fff" },
  sidebarRole: { fontSize: "9.5px", color: MINT, letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "4px" },
  sidebarHead: { fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" as const, color: MINT, borderBottom: `1px solid ${MINT_DARK}`, paddingBottom: "3px", marginBottom: "8px" },
  sidebarText: { fontSize: "9.5px", color: "#b8d8cc", lineHeight: "1.7" },
  skillChip: { display: "inline-block", backgroundColor: "#1a5740", color: "#e0f7f0", padding: "2px 7px", borderRadius: "3px", fontSize: "9px", margin: "2px 2px 0 0" } as React.CSSProperties,
  main: { flex: 1, padding: "28px 28px 28px 24px" } as React.CSSProperties,
  section: { marginBottom: "16px" } as React.CSSProperties,
  sectionHead: { fontSize: "11px", fontWeight: "700", color: MINT_DARK, borderBottom: `2px solid ${MINT}`, paddingBottom: "3px", marginBottom: "10px", letterSpacing: "0.5px" } as React.CSSProperties,
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1px" } as React.CSSProperties,
  jobRole: { fontWeight: "700", fontSize: "11px" } as React.CSSProperties,
  jobDate: { fontSize: "9.5px", color: "#666", whiteSpace: "nowrap" as const, marginLeft: "8px" },
  jobCompany: { color: MINT_DARK, fontWeight: "600", fontSize: "10px", marginBottom: "3px" },
  badge: { display: "inline-block", backgroundColor: MINT_LIGHT, color: MINT_DARK, padding: "1px 6px", borderRadius: "3px", fontSize: "9px", marginRight: "3px", marginBottom: "2px" } as React.CSSProperties,
};

export function Creative({ data }: { data: ResumeData }) {
  const p = data.personalInfo ?? {};
  const techSkills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])].filter(Boolean);
  const contacts = [
    p.email && { icon: "✉", val: p.email },
    p.phone && { icon: "☎", val: p.phone },
    p.location && { icon: "⌖", val: p.location },
    p.linkedin && { icon: "in", val: p.linkedin },
    p.github && { icon: "⊛", val: p.github },
  ].filter(Boolean) as { icon: string; val: string }[];

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div>
          <div style={S.sidebarName}>{p.fullName || "Your Name"}</div>
          {data.targetRole && <div style={S.sidebarRole}>{data.targetRole}</div>}
        </div>

        {contacts.length > 0 && (
          <div>
            <div style={S.sidebarHead}>Contact</div>
            {contacts.map(({ icon, val }, i) => (
              <div key={i} style={{ ...S.sidebarText, display: "flex", gap: "6px", marginBottom: "3px", wordBreak: "break-word" as const }}>
                <span style={{ color: MINT, flexShrink: 0, fontSize: "10px" }}>{icon}</span>
                <span style={{ fontSize: "9px" }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {techSkills.length > 0 && (
          <div>
            <div style={S.sidebarHead}>Skills</div>
            <div>
              {techSkills.map((s, i) => <span key={i} style={S.skillChip}>{s}</span>)}
            </div>
          </div>
        )}

        {(data.softSkills ?? []).filter(Boolean).length > 0 && (
          <div>
            <div style={S.sidebarHead}>Soft Skills</div>
            {data.softSkills!.filter(Boolean).map((s, i) => (
              <div key={i} style={{ ...S.sidebarText, marginBottom: "2px" }}>• {s}</div>
            ))}
          </div>
        )}

        {(data.education ?? []).filter(e => e.degree).length > 0 && (
          <div>
            <div style={S.sidebarHead}>Education</div>
            {data.education!.filter(e => e.degree).map((ed, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ color: "#fff", fontSize: "10px", fontWeight: "600" }}>{ed.degree}</div>
                <div style={{ ...S.sidebarText, fontSize: "9px" }}>{ed.college}</div>
                <div style={{ color: MINT, fontSize: "9px" }}>{ed.year}{ed.cgpa ? ` · ${ed.cgpa}` : ""}</div>
              </div>
            ))}
          </div>
        )}

        {(data.certifications ?? []).filter(c => c.name).length > 0 && (
          <div>
            <div style={S.sidebarHead}>Certifications</div>
            {data.certifications!.filter(c => c.name).map((c, i) => (
              <div key={i} style={{ ...S.sidebarText, marginBottom: "3px", fontSize: "9px" }}>
                <span style={{ color: "#fff", fontWeight: "600" }}>{c.name}</span>
                {c.year ? <span style={{ color: MINT }}> {c.year}</span> : ""}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={S.main}>
        {p.summary && (
          <div style={S.section}>
            <div style={S.sectionHead}>About Me</div>
            <p style={{ color: "#444", fontStyle: "italic" }}>{p.summary}</p>
          </div>
        )}

        {(data.experience ?? []).filter(e => e.company).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHead}>Work Experience</div>
            {data.experience!.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={S.jobHeader}>
                  <span style={S.jobRole}>{e.role}</span>
                  <span style={S.jobDate}>{e.duration}</span>
                </div>
                <div style={S.jobCompany}>{e.company}</div>
                {e.responsibilities && <p style={{ color: "#555", marginTop: "3px" }}>{e.responsibilities}</p>}
              </div>
            ))}
          </div>
        )}

        {(data.internships ?? []).filter(e => e.company).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHead}>Internships</div>
            {data.internships!.filter(e => e.company).map((e, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={S.jobHeader}>
                  <span style={S.jobRole}>{e.role}</span>
                  <span style={S.jobDate}>{e.duration}</span>
                </div>
                <div style={S.jobCompany}>{e.company}</div>
                {e.details && <p style={{ color: "#555", marginTop: "3px" }}>{e.details}</p>}
              </div>
            ))}
          </div>
        )}

        {(data.projects ?? []).filter(pr => pr.name).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHead}>Projects</div>
            {data.projects!.filter(pr => pr.name).map((pr, i) => (
              <div key={i} style={{ marginBottom: "9px" }}>
                <div style={{ ...S.jobHeader, marginBottom: "3px" }}>
                  <span style={{ fontWeight: "700" }}>{pr.name}</span>
                </div>
                {pr.technologies && (
                  <div style={{ marginBottom: "3px" }}>
                    {pr.technologies.split(/[,|]/).map(t => t.trim()).filter(Boolean).map((t, ti) => (
                      <span key={ti} style={S.badge}>{t}</span>
                    ))}
                  </div>
                )}
                {pr.description && <p style={{ color: "#555" }}>{pr.description}</p>}
              </div>
            ))}
          </div>
        )}

        {(data.achievements ?? []).filter(a => a.title).length > 0 && (
          <div style={S.section}>
            <div style={S.sectionHead}>Achievements</div>
            {data.achievements!.filter(a => a.title).map((a, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <span style={{ fontWeight: "700", color: MINT_DARK }}>▸ {a.title}</span>
                {a.description ? <span style={{ color: "#555" }}> — {a.description}</span> : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
