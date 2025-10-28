# Archestra Design System

## Vision
Archestra is a digital atelier for architects and interior designers. The visual identity reflects **sophistication, balance, and clarity** — the core principles of architectural design itself.

---

## 🎨 Color Palette

### Light Mode
- **Ice White** (`#F7F8F9` / `210 17% 98%`) — Clean, sophisticated background
- **Warm Light Gray** (`#EDECEA` / `40 10% 93%`) — Secondary background with subtle warmth
- **Blue-Gray** (`#7A8BA3` / `215 17% 56%`) — Primary action color, calm and professional
- **Mint Green** (`#8DB6A5` / `156 24% 62%`) — Success states, positive feedback
- **Terracotta Soft** (`#C97C5D` / `14 48% 58%`) — Accent for creative highlights
- **Burnt Red** (`#B85C52` / `6 58% 53%`) — Destructive/urgent actions

### Dark Mode
- **Graphite Dark** (`#1F1F1F` / `0 0% 12%`) — Sophisticated dark background
- Adjusted palette for readability while maintaining elegance

### Design Reasoning
Colors inspired by architectural materials:
- **Blue-Gray**: Steel, concrete, modern structures
- **Terracotta**: Warm clay, human touch in construction
- **Mint Green**: Natural spaces, balance
- Neutral bases prevent visual fatigue during long work sessions

---

## 🖋️ Typography

### Font Families
- **Headings**: `Inter` / `Poppins` — Geometric, modern, crisp hierarchy
- **Body**: `Work Sans` / `IBM Plex Sans` — Humanized, readable for extended reading

### Scale & Weight
- **H1**: 3.5rem–4rem (clamp for responsiveness), weight 600–700
- **H2**: 2rem–2.5rem, weight 600
- **Body**: 1rem, weight 400, line-height 1.7 for readability
- **Letter spacing**: -0.02em on headings for tighter, cleaner look

### Design Reasoning
- Sans-serif fonts convey modernity and clarity
- Generous line height (1.7) prevents text cramping
- Weight contrast (300–600) defines hierarchy without heavy dividers

---

## 🧱 Layout & Components

### Spacing & Rhythm
- **Container max-width**: 1200px for desktop
- **Card padding**: 2rem (32px) for breathing space
- **Section spacing**: 6rem (96px) vertical between major sections
- **Border radius**: 12px (0.75rem) for soft, modern edges

### Shadows & Depth
- **Soft**: `0 2px 8px rgba(0,0,0,0.06)` — Subtle lift for cards
- **Medium**: `0 4px 12px rgba(0,0,0,0.04)` — Standard elevation
- **Elegant**: `0 12px 32px rgba(0,0,0,0.08)` — Hover states, modals

### Component Patterns

#### Buttons
- **Primary**: Blue-gray background, hover lifts with shadow
- **Outline**: Border-only, fills on hover
- **Transition**: 0.3–0.4s cubic-bezier for smooth, natural feel

#### Cards
- Border: 0.5px subtle (`border-border/50`)
- Hover: Lift + shadow + border color shift
- Rounded corners: 12px (consistent system)

#### Navigation
- Fixed navbar with backdrop blur for modern feel
- Underline animation on links (slide from center)
- Subtle gradient on logo text

---

## 🌊 Motion & Interaction

### Animation Principles
1. **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` — Natural deceleration
2. **Duration**: 0.4–0.6s for most transitions
3. **Spring**: Slight overshoot for playfulness without overdoing

### Key Animations
- **Fade In**: Opacity + slight Y translation (20px)
- **Scale In**: Subtle scale (0.95 → 1) for depth
- **Hover Lift**: `translateY(-2px)` + shadow increase
- **Stagger**: Sequential reveals with 0.1s delay between items

### Landing Page Dynamics
- Hero section: Fade + scale on load
- Feature cards: Staggered fade-in on scroll
- Testimonials: Slide + fade with delay
- CTA section: Gradient overlay + grid pattern background

---

## 📱 Responsiveness

### Breakpoints
- **Mobile**: <768px — Single column, larger touch targets
- **Tablet**: 768–1200px — Two columns, adaptive padding
- **Desktop**: >1200px — Full grid, generous spacing

### Adaptive Typography
Use `clamp()` for fluid scaling:
```css
font-size: clamp(2rem, 5vw, 4rem);
```

### Mobile Considerations
- Stack all grid layouts to single column
- Increase button padding for touch
- Reduce section spacing (4rem instead of 6rem)
- Ensure navbar remains accessible (hamburger menu if needed)

---

## 🎯 Design Philosophy

### Core Principles
1. **Clarity over decoration** — Every element serves a purpose
2. **Breathing space** — Generous margins prevent cognitive overload
3. **Subtle sophistication** — Refinement through restraint
4. **Tactile feedback** — Hover, focus, and active states are always clear
5. **Accessible contrast** — WCAG AA compliant color pairings

### References
Inspired by:
- **Figma**: Clean interface, focus on content
- **Linear**: Smooth animations, elegant simplicity
- **Notion**: Hierarchical clarity, soft shadows
- **ArchDaily / Dezeen**: Architectural aesthetic, visual storytelling

---

## ✅ Implementation Checklist

- [x] Global color tokens in CSS variables (HSL format)
- [x] Typography system with Inter and Work Sans
- [x] Button variants with hover states
- [x] Card components with elegant shadows
- [x] Navbar with backdrop blur and link animations
- [x] Landing page with staggered animations
- [x] Testimonials and feature cards redesigned
- [x] Footer with refined spacing
- [x] Responsive breakpoints defined
- [x] Accessibility (focus states, contrast ratios)

---

## 🚀 Next Steps (Future Enhancements)

- [ ] Dark mode toggle in UI
- [ ] More animation variants (parallax, scroll-triggered)
- [ ] Component library documentation
- [ ] A/B testing on CTA placements
- [ ] Performance optimization (lazy loading animations)

---

*Last updated: October 2025*  
*Version: 1.0.0*
