# Homepage redesign validation

Checked in Chromium on 2026-09-06 using Playwright and axe-core 4.10.3. Preview images show a clean browser with no sample favorites or fabricated visit history.

| Area | Result |
| --- | --- |
| Navigation | All 12 existing service hosts retained; HTTPS URLs, new-tab navigation, `noopener noreferrer`, and complete CPA / Kiro paths verified. |
| Search | Chinese aliases, case-insensitive names, domains, multiple words, category combinations, empty results, clear, `/`, `Ctrl+K`, and `Esc` passed. |
| Favorites | Add/remove, filtering, persistence, removal focus, and cross-tab synchronization passed. |
| Recent visits | Four unique entries, visit ordering, native link opening, full URL preservation, reload persistence, and clearing passed. |
| Storage recovery | Legacy hostname migration, malformed JSON, invalid types, unknown hosts, and blocked storage fallback passed. |
| Themes | System default and persistent manual selection passed. |
| Responsive layout | No horizontal overflow at widths 320, 360, 390, 600, 768, 900, 1024, 1440, and 1920 px. Recent visits remain available on mobile. |
| Reduced motion | No running animations when reduced motion is enabled. |
| JavaScript disabled | All 12 navigation links remain available; nonfunctional controls stay hidden. |
| Accessibility | No axe violations for WCAG 2 A / AA, 2.1 AA, and 2.2 AA rule tags in desktop light, desktop dark, and mobile light views. Automated checks do not replace assistive-technology review. |
| Runtime | No JavaScript errors or third-party requests during normal page loading. |

The delivered HTML, CSS, JavaScript, and favicon total approximately **65.2 KB uncompressed**. Locally estimated combined gzip size is approximately **17.2 KB**; actual transfer compression depends on hosting. The preview images in this directory are not loaded by the homepage. No production latency or Lighthouse score is claimed.

Service availability is separate from navigation correctness. During read-only inspection, `panel.hipw.cc` responded with a page titled “暂时无法访问”; its existing destination is retained, and the homepage does not advertise an unverified online status.

## Previews

- [Desktop, light theme](light.png)
- [Desktop, dark theme](dark.png)
- [Mobile, light theme](mobile.png)
