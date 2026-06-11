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

export function Minimal({ data }: { data: ResumeData }) {
  const p = data.personalInfo ?? {};
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])];
  return (
    <div className="bg-white text-[#222] font-['Georgia',serif] text-[11px] leading-[1.6] w-full min-h-[1056px] px-[56px] py-[52px]" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="text-center mb-6">
        <h1 className="text-[24px] font-normal tracking-[0.15em] uppercase mb-2">{p.fullName ?? "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 text-[9.5px] text-[#666] tracking-wide">
          {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).join("  ·  ")}
        </div>
      </div>

      {p.summary && <MinSection title="Profile"><p className="italic text-[#444]">{p.summary}</p></MinSection>}

      {(data.experience ?? []).length > 0 && (
        <MinSection title="Experience">
          {data.experience!.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-[11px]">
                <span>{e.role}, <em>{e.company}</em></span>
                <span className="text-[#777]">{e.duration}</span>
              </div>
              <p className="text-[#555] mt-0.5">{e.responsibilities}</p>
            </div>
          ))}
        </MinSection>
      )}

      {(data.internships ?? []).length > 0 && (
        <MinSection title="Internships">
          {data.internships!.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-[11px]">
                <span>{e.role}, <em>{e.company}</em></span>
                <span className="text-[#777]">{e.duration}</span>
              </div>
              {e.details && <p className="text-[#555] mt-0.5">{e.details}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {(data.education ?? []).length > 0 && (
        <MinSection title="Education">
          {data.education!.map((ed, i) => (
            <div key={i} className="mb-2 flex justify-between">
              <span>{ed.degree}, <em>{ed.college}</em>{ed.cgpa ? ` · ${ed.cgpa}` : ""}</span>
              <span className="text-[#777]">{ed.year}</span>
            </div>
          ))}
        </MinSection>
      )}

      {skills.length > 0 && (
        <MinSection title="Skills">
          <p>{skills.join(", ")}</p>
          {(data.softSkills ?? []).length > 0 && <p className="mt-1 text-[#555]"><em>Soft:</em> {data.softSkills!.join(", ")}</p>}
        </MinSection>
      )}

      {(data.projects ?? []).length > 0 && (
        <MinSection title="Projects">
          {data.projects!.map((pr, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold">{pr.name}</span>
              {pr.technologies && <span className="text-[#666]"> — {pr.technologies}</span>}
              <p className="text-[#555]">{pr.description}</p>
            </div>
          ))}
        </MinSection>
      )}

      {(data.certifications ?? []).length > 0 && (
        <MinSection title="Certifications">
          {data.certifications!.map((c, i) => (
            <div key={i}>{c.name}{c.issuer ? `, ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</div>
          ))}
        </MinSection>
      )}

      {(data.achievements ?? []).length > 0 && (
        <MinSection title="Achievements">
          {data.achievements!.map((a, i) => (
            <div key={i} className="mb-1"><span className="font-semibold">{a.title}</span>{a.description ? ` — ${a.description}` : ""}</div>
          ))}
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#999] mb-2">{title}</h2>
      <div className="border-t border-[#e8e8e8] pt-2">{children}</div>
    </div>
  );
}
