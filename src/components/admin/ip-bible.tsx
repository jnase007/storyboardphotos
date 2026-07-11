"use client";

export function IPBible() {
  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F4EC" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 pb-6 border-b-2" style={{ borderColor: "#B98A19" }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📖</span>
            <h1 className="text-4xl font-bold" style={{ color: "#0A1628" }}>Storybook Photos — IP Bible</h1>
          </div>
          <p className="text-lg" style={{ color: "#6b7280" }}>
            The complete technical and business blueprint for how this product was built.
          </p>
          <p className="text-sm mt-2" style={{ color: "#B98A19" }}>
            Version 1.0 · Built July 2026 · Costa Mesa, CA
          </p>
        </div>

        {/* Vision */}
        <Section title="🎯 The Vision" color="#0A1628">
          <p>A premium fantasy photo studio where children are photographed in 4 enchanted kingdom sets, then receive a personalized hardcover storybook featuring themselves as the hero — with AI-generated watercolor illustrations placing the child in magical scenes the camera couldn&apos;t capture.</p>
          <p className="mt-3 font-semibold" style={{ color: "#B98A19" }}>One portrait upload drives the entire personalized book.</p>
        </Section>

        {/* The Product */}
        <Section title="📚 The Product" color="#0A1628">
          <SubSection title="Physical Studio — 4 Kingdom Sets">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Throne Room</strong> — Royal throne, crimson and gold banners, marble floor</li>
              <li><strong>Royal Forest</strong> — Ancient trees, glowing lanterns, mossy stone paths</li>
              <li><strong>Royal Garden</strong> — Wildflowers, climbing roses, castle towers in background</li>
              <li><strong>Chastle</strong> — Courage quest set with armor, stone walls, quest atmosphere</li>
            </ul>
          </SubSection>

          <SubSection title="The Storybook — 10 Pages">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr style={{ background: "#0A1628", color: "#C5A26F" }}>
                    <th className="p-2 text-left">Page</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "🎨 Watercolor", "Title page — castle scene"],
                    ["2", "🎨 Watercolor", "The Call to Adventure"],
                    ["3", "📸 Real Photo", "Throne Room portrait"],
                    ["4", "🎨 Watercolor", "A Royal Promise scene"],
                    ["5", "📸 Real Photo", "Royal Forest portrait"],
                    ["6", "🎨 Watercolor", "Dragon encounter — child's face"],
                    ["7", "📸 Real Photo", "Royal Garden portrait"],
                    ["8", "📸 Real Photo", "Chastle portrait"],
                    ["9", "🎨 Watercolor", "Victory — child's face"],
                    ["10", "🎨 Watercolor", "The End — peaceful castle"],
                  ].map(([page, type, content]) => (
                    <tr key={page} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td className="p-2 font-mono">{page}</td>
                      <td className="p-2">{type}</td>
                      <td className="p-2">{content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>
        </Section>

        {/* How It Works */}
        <Section title="⚙️ How It Works — The Pipeline" color="#0A1628">
          <ol className="space-y-4 list-none">
            {[
              ["1", "Portrait Upload", "Staff uploads a white-background portrait of the child. This single photo drives all AI-generated pages."],
              ["2", "Set Photo Upload", "Staff uploads 1-3 photos per kingdom set. These become the real photography pages in the book."],
              ["3", "Adventure Path", "Staff selects which story the child chose (Dragon Quest, Rescue Mission, etc.). Each path has a full script."],
              ["4", "Story Generation", "Grok AI personalizes the story text with the child's name, age, and gender. The script is filled with the child's details."],
              ["5", "Scene Generation", "Gemini 3.1 Flash Image takes the child's portrait + generates them as a watercolor hero in each action scene (dragon battle, victory, etc.)."],
              ["6", "Static Scenes", "Pre-approved watercolor backgrounds (castle, forest, garden) are served from Supabase for title/call/end pages — no generation needed."],
              ["7", "PDF Build", "Server-side PDF generation embeds all images without CORS issues. Cover uses castle watercolor + child's name overlay."],
              ["8", "Share & Print", "Staff downloads PDF for Mpix printing OR shares a client link (/book/[id]) the parent can view on their phone."],
            ].map(([num, title, desc]) => (
              <li key={num} className="flex gap-4">
                <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ background: "#B98A19" }}>{num}</span>
                <div>
                  <div className="font-bold" style={{ color: "#0A1628" }}>{title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Tech Stack */}
        <Section title="🛠 Tech Stack" color="#0A1628">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Framework", "Next.js 15 (App Router) + TypeScript"],
              ["Styling", "Tailwind CSS + shadcn/ui"],
              ["Database", "Supabase (PostgreSQL + Storage)"],
              ["AI — Story", "xAI Grok 4.5 (text generation)"],
              ["AI — Scenes", "Google Gemini 3.1 Flash Image (multimodal)"],
              ["AI — Backup", "Google Imagen 4.0 (70 images/day limit)"],
              ["PDF", "jsPDF (server-side generation)"],
              ["Hosting", "Vercel (auto-deploy from GitHub)"],
              ["Storage", "Supabase Storage (story-scenes bucket)"],
              ["Admin PIN", "3121"],
            ].map(([key, val]) => (
              <div key={key} className="p-3 rounded-lg" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#B98A19" }}>{key}</div>
                <div className="text-sm mt-1 font-medium" style={{ color: "#0A1628" }}>{val}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Business Model */}
        <Section title="💰 Business Model" color="#0A1628">
          <div className="space-y-3">
            {[
              ["Digital Coloring Book", "$199", "Portrait only — no studio visit. All 10 pages are AI watercolor with child's face. Ship digitally anywhere."],
              ["One Set", "$299", "Portrait + 1 studio set. 1-2 real photos, 8-9 watercolor pages."],
              ["Two Sets", "$399", "Portrait + 2 studio sets. Balanced mix."],
              ["Full Kingdom", "$599", "Portrait + all 4 sets. 4 real photos + 6 watercolor. Current flagship product."],
              ["Grand Royal", "$999", "Everything above + animated video (Veo 3 + ElevenLabs narration)."],
            ].map(([name, price, desc]) => (
              <div key={name} className="flex gap-4 p-4 rounded-xl" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <div className="text-xl font-bold w-20 flex-shrink-0" style={{ color: "#B98A19" }}>{price}</div>
                <div>
                  <div className="font-bold" style={{ color: "#0A1628" }}>{name}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Key Architecture Decisions */}
        <Section title="🏗 Architecture Decisions" color="#0A1628">
          <div className="space-y-3">
            {[
              ["Why Gemini for character scenes?", "Gemini multimodal takes the portrait photo + generates watercolor scene with that child in it. One API call. No separate face extraction step needed."],
              ["Why static scenes for title/end?", "Title, call, victory, end pages don't need the child's face — they're atmospheric scenes. Pre-generating saves API calls and ensures consistent quality."],
              ["Why server-side PDF?", "Client-side PDF can't fetch Supabase URLs (CORS). Server has no CORS restrictions and can embed any image URL directly."],
              ["Why Supabase for generated images?", "Gemini returns base64 data URLs (~1MB). JSON can't handle this in API responses. Images upload to Supabase first, return a public URL."],
              ["Why Grok for story text?", "87% cheaper than Claude Opus ($2/$6 vs $15/$75 per million tokens). Story generation is straightforward — no premium reasoning needed."],
              ["Why white background portrait?", "Clean extraction without manual masking. Gemini can easily identify the subject. Ensures consistent character placement across scenes."],
            ].map(([q, a]) => (
              <details key={q} className="p-4 rounded-xl cursor-pointer" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <summary className="font-bold" style={{ color: "#0A1628" }}>{q}</summary>
                <p className="text-sm text-gray-600 mt-2">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* URLs & Access */}
        <Section title="🔗 URLs & Access" color="#0A1628">
          <div className="space-y-2 text-sm font-mono">
            {[
              ["Production", "https://storybookphotos.com"],
              ["Admin Dashboard", "https://storybookphotos.com/admin (PIN: 3121)"],
              ["Storybook Generator", "https://storybookphotos.com/admin/storybook-generator"],
              ["Books Library", "https://storybookphotos.com/admin/books"],
              ["Story Scripts", "https://storybookphotos.com/admin/story-scripts"],
              ["IP Bible", "https://storybookphotos.com/admin/ip"],
              ["Client Book View", "https://storybookphotos.com/book/[id]"],
              ["GitHub", "https://github.com/jnase007/storyboardphotos"],
              ["Supabase Project", "cpnnztrqgbxledbikpqt.supabase.co"],
              ["Vercel Project", "prj_XggOsp9FjgqVteabzeCYO9vPBPsO"],
            ].map(([label, url]) => (
              <div key={label} className="flex gap-3 p-2 rounded" style={{ background: "#f9fafb" }}>
                <span className="w-36 flex-shrink-0 font-semibold" style={{ color: "#B98A19" }}>{label}</span>
                <span style={{ color: "#0A1628" }}>{url}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Book Covers */}
        <Section title="📚 The Two Books" color="#0A1628">
          <p className="mb-4">Every session produces two distinct premium hardcover books. Each has its own cover design, title, and purpose.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#C5A26F40" }}>
              <img src="https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/hero-images/cover-chronicles-hq.jpg" alt="Kingdom Chronicles Cover" className="w-full" />
              <div className="p-4" style={{ background: "#fafafa" }}>
                <div className="font-bold text-lg mb-1" style={{ color: "#0A1628" }}>📖 Kingdom Chronicles</div>
                <div className="text-sm mb-2" style={{ color: "#B98A19" }}>The Adventure Storybook — Dad's favorite</div>
                <ul className="text-xs space-y-1" style={{ color: "#6b7280" }}>
                  <li>• AI watercolor illustrations — child as the hero</li>
                  <li>• Gemini generates child's face in each scene</li>
                  <li>• 6 adventure paths, personalized story text</li>
                  <li>• Navy/filigree luxury cover</li>
                  <li>• "[Name]'s Kingdom Chronicles" title in gold</li>
                  <li>• Price: $299 standalone / included in Royal Collection</li>
                </ul>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#C5A26F40" }}>
              <img src="https://cpnnztrqgbxledbikpqt.supabase.co/storage/v1/object/public/hero-images/cover-portraits-hq.jpg" alt="Royal Portraits Cover" className="w-full" />
              <div className="p-4" style={{ background: "#fafafa" }}>
                <div className="font-bold text-lg mb-1" style={{ color: "#0A1628" }}>📸 Royal Portrait Album</div>
                <div className="text-sm mb-2" style={{ color: "#B98A19" }}>The Photo Book — Mom's favorite</div>
                <ul className="text-xs space-y-1" style={{ color: "#6b7280" }}>
                  <li>• Professional studio photos from all 4 sets</li>
                  <li>• Best session portrait as the cover image</li>
                  <li>• Child's name on the cover</li>
                  <li>• Rose garden botanical luxury cover</li>
                  <li>• "[Name]'s Royal Portraits" title in gold</li>
                  <li>• Price: $299 standalone / included in Royal Collection</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 mb-4" style={{ background: "#fdf8e8", border: "1px solid #C5A26F40" }}>
            <div className="font-bold mb-2" style={{ color: "#B98A19" }}>Cover Specs (both books)</div>
            <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: "#0A1628" }}>
              {[
                ["Size", "8x8 inch square (8.25 inch with bleed)"],
                ["Format", "PDF → Mpix 8x8 photo book"],
                ["Cover image", "Generated by Imagen 4.0 (high quality)"],
                ["Name overlay", "22pt gold italic, thin rule below"],
                ["Branding", "Small footer: Storybook Photos · Kingdom Quests"],
                ["Back cover", "Matching style + storybookphotos.com"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="font-semibold">{k}:</span> {v}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="font-bold text-emerald-700 mb-1">The Pitch</div>
            <p className="text-sm text-emerald-700">"My husband loves the adventure story. I love the portrait album." Every family has a Justin and a Lachelle. Two books = two reasons to buy = higher average ticket.</p>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-400" style={{ borderColor: "#e5e7eb" }}>
          Built by Justin Nassie + Tinny Tim (AI) · Storybook Photos | Kingdom Quests · Costa Mesa, CA · 2026
        </div>

      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4" style={{ color }}>{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-lg mb-2" style={{ color: "#B98A19" }}>{title}</h3>
      {children}
    </div>
  );
}
