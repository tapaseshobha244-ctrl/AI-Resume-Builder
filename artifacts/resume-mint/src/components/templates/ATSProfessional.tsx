type ResumeData = {
  personalInfo?: { fullName?: string; email?: string; phone?: string; location?: string; linkedin?: string | null; github?: string | null; portfolio?: string | null; summary?: string | null };
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

export function ATSProfessional({ data }: { data: ResumeData }) {
  const p = data.personalInfo ?? {};
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])];
  return (
    <div className="bg-white text-[#1a1a1a] font-['Arial','Helvetica',sans-serif] text-[11px] leading-[1.45] w-full min-h-[1056px] p-[48px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <div className="mb-4 border-b-2 border-[#1a1a1a] pb-3">
        <h1 className="text-[22px] font-bold tracking-wide uppercase mb-1">{p.fullName ?? "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[#444]">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
          {p.portfolio && <span>{p.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <Section title="PROFESSIONAL SUMMARY">
          <p>{p.summary}</p>
        </Section>
      )}

      {/* Experience */}
      {(data.experience ?? []).length > 0 && (
        <Section title="WORK EXPERIENCE">
          {data.experience!.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{e.role} — {e.company}</span>
                <span>{e.duration}</span>
              </div>
              <p className="text-[#333] mt-0.5">{e.responsibilities}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Internships */}
      {(data.internships ?? []).length > 0 && (
        <Section title="INTERNSHIPS">
          {data.internships!.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{e.role} — {e.company}</span>
                <span>{e.duration}</span>
              </div>
              {e.details && <p className="text-[#333] mt-0.5">{e.details}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {(data.education ?? []).length > 0 && (
        <Section title="EDUCATION">
          {data.education!.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between font-bold">
                <span>{ed.degree}</span>
                <span>{ed.year}</span>
              </div>
              <div className="text-[#444]">{ed.college}{ed.cgpa ? ` — CGPA: ${ed.cgpa}` : ""}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="TECHNICAL SKILLS">
          <p>{skills.join(" • ")}</p>
          {(data.softSkills ?? []).length > 0 && (
            <p className="mt-1"><span className="font-semibold">Soft Skills:</span> {data.softSkills!.join(" • ")}</p>
          )}
        </Section>
      )}

      {/* Projects */}
      {(data.projects ?? []).length > 0 && (
        <Section title="PROJECTS">
          {data.projects!.map((pr, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold">{pr.name}</span>
              {pr.technologies && <span className="text-[#555]"> | {pr.technologies}</span>}
              {pr.githubLink && <span className="text-[#555]"> | {pr.githubLink}</span>}
              <p className="mt-0.5">{pr.description}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {(data.certifications ?? []).length > 0 && (
        <Section title="CERTIFICATIONS">
          {data.certifications!.map((c, i) => (
            <div key={i}>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</div>
          ))}
        </Section>
      )}

      {/* Achievements */}
      {(data.achievements ?? []).length > 0 && (
        <Section title="ACHIEVEMENTS">
          {data.achievements!.map((a, i) => (
            <div key={i} className="mb-1"><span className="font-semibold">{a.title}</span>{a.description ? `: ${a.description}` : ""}</div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[11px] font-bold tracking-widest uppercase mb-1.5 border-b border-[#ccc] pb-0.5">{title}</h2>
      {children}
    </div>
  );
}
