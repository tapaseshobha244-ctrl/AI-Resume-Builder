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

export function ModernCorporate({ data }: { data: ResumeData }) {
  const p = data.personalInfo ?? {};
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])];
  return (
    <div className="bg-white text-[#1a1a1a] font-['Arial',sans-serif] text-[10.5px] leading-[1.5] w-full min-h-[1056px] flex" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Left sidebar */}
      <div className="w-[200px] bg-[#1e2d3d] text-white p-6 shrink-0 flex flex-col gap-5">
        <div>
          <h1 className="text-[16px] font-bold leading-tight mb-1">{p.fullName ?? "Your Name"}</h1>
          {data.targetRole && <p className="text-[10px] text-[#8bb8e8] uppercase tracking-wide">{data.targetRole}</p>}
        </div>
        <div>
          <SideHead>Contact</SideHead>
          <div className="space-y-1 text-[10px] text-[#ccc]">
            {p.email && <p>{p.email}</p>}
            {p.phone && <p>{p.phone}</p>}
            {p.location && <p>{p.location}</p>}
            {p.linkedin && <p className="truncate">{p.linkedin}</p>}
            {p.github && <p className="truncate">{p.github}</p>}
          </div>
        </div>
        {skills.length > 0 && (
          <div>
            <SideHead>Skills</SideHead>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="text-[9px] bg-[#2a3f57] px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          </div>
        )}
        {(data.softSkills ?? []).length > 0 && (
          <div>
            <SideHead>Soft Skills</SideHead>
            <div className="space-y-0.5 text-[10px] text-[#ccc]">
              {data.softSkills!.map((s, i) => <p key={i}>• {s}</p>)}
            </div>
          </div>
        )}
        {(data.certifications ?? []).length > 0 && (
          <div>
            <SideHead>Certifications</SideHead>
            <div className="space-y-1 text-[10px] text-[#ccc]">
              {data.certifications!.map((c, i) => (
                <p key={i}>{c.name}{c.year ? ` (${c.year})` : ""}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 p-6 space-y-4">
        {p.summary && (
          <RSection title="Summary">
            <p>{p.summary}</p>
          </RSection>
        )}
        {(data.experience ?? []).length > 0 && (
          <RSection title="Experience">
            {data.experience!.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <span className="font-bold text-[11px]">{e.role}</span>
                  <span className="text-[#666] text-[10px]">{e.duration}</span>
                </div>
                <div className="text-[#4a6a8a] font-medium mb-0.5">{e.company}</div>
                <p className="text-[#444]">{e.responsibilities}</p>
              </div>
            ))}
          </RSection>
        )}
        {(data.internships ?? []).length > 0 && (
          <RSection title="Internships">
            {data.internships!.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <span className="font-bold text-[11px]">{e.role}</span>
                  <span className="text-[#666] text-[10px]">{e.duration}</span>
                </div>
                <div className="text-[#4a6a8a] font-medium mb-0.5">{e.company}</div>
                {e.details && <p className="text-[#444]">{e.details}</p>}
              </div>
            ))}
          </RSection>
        )}
        {(data.education ?? []).length > 0 && (
          <RSection title="Education">
            {data.education!.map((ed, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[11px]">{ed.degree}</span>
                  <span className="text-[#666] text-[10px]">{ed.year}</span>
                </div>
                <div className="text-[#444]">{ed.college}{ed.cgpa ? ` • CGPA: ${ed.cgpa}` : ""}</div>
              </div>
            ))}
          </RSection>
        )}
        {(data.projects ?? []).length > 0 && (
          <RSection title="Projects">
            {data.projects!.map((pr, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold">{pr.name}</span>
                {pr.technologies && <span className="text-[#4a6a8a]"> | {pr.technologies}</span>}
                <p className="mt-0.5 text-[#444]">{pr.description}</p>
              </div>
            ))}
          </RSection>
        )}
        {(data.achievements ?? []).length > 0 && (
          <RSection title="Achievements">
            {data.achievements!.map((a, i) => (
              <div key={i} className="mb-1"><span className="font-semibold">{a.title}</span>{a.description ? ` — ${a.description}` : ""}</div>
            ))}
          </RSection>
        )}
      </div>
    </div>
  );
}

function SideHead({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8bb8e8] mb-1.5 border-b border-[#2a3f57] pb-0.5">{children}</h3>;
}
function RSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[12px] font-bold uppercase tracking-wide text-[#1e2d3d] mb-2 border-b-2 border-[#1e2d3d] pb-0.5">{title}</h2>
      {children}
    </div>
  );
}
