# U-Train Driving School — website

A static marketing site for U-Train Driving School, Kampala.
*Learn well. Go well.*

Plain HTML, one stylesheet and one small script. No framework, no build step,
nothing to install before it will run.

---

## Run it locally

```
node server.js 4190
```

Then open <http://localhost:4190>. `server.js` is a ~40-line static file server
and is **not** uploaded to the host — it exists only for previewing.

---

## The design: "Road Signs"

The whole site is built from the language of the road, and that is the one rule
worth protecting. If a change would look at home on a motorway gantry, it fits.
If it looks like a generic SaaS card, it does not.

| Element | What it is |
| --- | --- |
| Display type | **Barlow Condensed** 700–800, uppercase — closest free face to transport signage |
| Body type | **Inter** 400–600 |
| Navy `#0B2B6B` | Structure: hero, dark bands, headers, table heads |
| Signal red `#D81F26` | Action only: buttons, active nav, the L plate |
| Hi-vis amber `#FFC02E` | Markings only: hazard tape, rules, the offer tag, warnings |
| Green `#19B36B` | Confirmations and ticks |
| Hazard tape | Top and bottom of every dark band (`--tape`) |
| Diamond plates | Every icon sits in a rotated square (`.icon-badge`) |
| Speed-limit discs | The numbered steps in "how it works" (`.step__n`) |
| Chevron tag | The amber direction sign (`.tagsign`) |
| Hard shadows | Flat offsets, never blur — buttons and cards shift on hover |

**Nothing is rounded.** The radius tokens still exist (`--r-sm` … `--r-xl`) so
older inline styles keep working, but every one of them is `0`. The only
circles on the site are the ones that are circular on a real road sign.

Two colours do the heavy lifting; amber is a marking, not a surface. Using it
for large areas is the fastest way to make this look like a children's toy.

---

## The pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, services, why us, courses, the four-step route, photo band, permits, branches, FAQ |
| `about.html` | The school, mission/vision/values, why choose us, inside a lesson, campaign flyers |
| `courses.html` | Three full courses, six skills modules, comparison table, schedules, FAQ |
| `permits.html` | Permit processing, renewal, class extensions, requirements, classes, FAQ |
| `enroll.html` | Registration form, what to bring, what happens next |
| `contact.html` | All five branches, map, message form, every phone number |
| `404.html` | Wrong-turn page (set as the error document on the host) |

---

## Photographs — the one thing still outstanding

The site is laid out around **six photographs the school is sending**. Until
they arrive, each slot holds a branded placeholder that states exactly what to
shoot.

To use the real pictures: **save each one over the placeholder file, keeping the
filename.** No markup changes, no resizing, nothing else to do.

| File in `assets/img/photos/` | The shot | Where it appears |
| --- | --- | --- |
| `01-hands-on-wheel.jpg` | Learner's hands on the wheel, close, shallow depth, from the passenger seat | Home — "Inside a lesson" |
| `02-instructor-junction.jpg` | Instructor talking a learner through a junction, both faces visible | Home, About |
| `03-car-on-road.jpg` | Marked U-Train car on a real Kampala road, roof sign and L plate readable | Home — "Why U-Train", social preview |
| `04-theory-class.jpg` | Theory class in session, wide, instructor mid-sentence | Home — "Inside a lesson" |
| `05-branch-front.jpg` | A branch frontage (Nakawa or Kireka), signage readable, straight on | Home — branches |
| `06-permit-portrait.jpg` | Learner holding their new permit, portrait, looking at camera | Home — permits |

Shoot early morning or between 4 and 6pm, landscape except the portrait, no
flash. A decent phone in that light beats any stock library, because the result
is visibly Kampala and visibly U-Train.

---

## Editing

**Content** lives directly in each `.html` file — open it and edit the text.

**Colours, spacing and components** are all in `assets/css/styles.css`, which
opens with a token block (`:root`):

```css
--navy-800:#0B2B6B;  /* structure */
--red-500:#D81F26;   /* action    */
--amber:#FFC02E;     /* markings  */
--ink:#0A1430;       /* lines and hazard tape */
```

**Phone numbers used by the scripts** are at the top of `assets/js/main.js`:

```js
var SCHOOL = {
  whatsapp: '256755938383',   // digits only, international format
  phoneMain: '0755938383',
  phoneAlt:  '0753197776'
};
```

Changing that constant changes where the forms send people. The `tel:` and
`wa.me` links written directly in the HTML have to be changed in the HTML.

### Changing the menu or the footer

The nav and footer are repeated in all seven pages, as they must be without a
build step. Edit **`index.html`** only, then run:

```
python tools/sync-chrome.py
```

That copies everything outside `<main>` from `index.html` onto the other six
pages, keeping each page's own content and metadata. It prints what it changed.

---

## Forms

There is no server behind this site, so the two forms (`enroll.html` and
`contact.html`) compose a tidy WhatsApp message from what the visitor typed and
open WhatsApp with it ready to send. Nothing is stored by the website, and
nothing is sent until the visitor presses send in WhatsApp. An "email instead"
link sits beside each button as a fallback.

The Google map on `contact.html` loads only when the visitor presses **Load the
map**, so nothing third-party runs on the page before then.

If a real inbox is wanted later, point the `<form>` at a form service
(Formspree, Web3Forms and similar all work with static hosting) and delete the
`data-wa-form` attribute — the JavaScript then leaves the form alone.

---

## Deploying

Pushing to `main` runs two independent workflows.

### 1. GitHub Pages — the preview

`.github/workflows/pages.yml` publishes every push to

> <https://josebanzuma1-cell.github.io/UTRAIN-DRIVING-SCHOOL/>

which is there so the site can be looked at and shared before the real hosting
is ready. Pages serves from a sub-path, which works only because every `src`
and `href` in the site is relative — **a single leading slash on an asset path
will break the preview while looking fine on the real domain.**

The workflow turns Pages on by itself on its first run. If that step fails on
permissions, set it by hand once under **Settings → Pages → Source → GitHub
Actions**, then re-run the workflow from the Actions tab. The source must be
"GitHub Actions", not "Deploy from a branch".

`_design/`, `tools/`, `server.js` and this README are left out of what gets
published.

Note that the canonical tags, `robots.txt` and `sitemap.xml` all point at
`utraindrivingschool.com`, so the preview will not compete with the real site
in search. That is deliberate — but it does mean those three need updating
when the real domain is settled.

### 2. Hostinger — the real site

Pushing to `main` uploads the site to Hostinger over FTPS via
`.github/workflows/deploy-hostinger.yml` — the same workflow used by the other
school sites in this folder.

Three repository secrets must exist under
**Settings → Secrets and variables → Actions**:

| Secret | Where it comes from |
| --- | --- |
| `FTP_SERVER` | hPanel → Files → FTP Accounts |
| `FTP_USERNAME` | that FTP account's username |
| `FTP_PASSWORD` | that FTP account's password |

And one optional repository **variable**:

| Variable | Set it to |
| --- | --- |
| `FTP_SERVER_DIR` | `/` when the FTP account is already scoped to `public_html`, otherwise leave unset |

Until all three secrets exist the workflow finishes green having uploaded
nothing, so it is safe to commit before the hosting is ready.

Do not use Hostinger's own Git integration — it does not work for these sites.

`_design/` and `tools/` are excluded from the upload.

---

## `_design/` — working files, never deployed

| File | What it is |
| --- | --- |
| `directions.html` | The four art directions that were put up for a decision — Night Shift, **Road Signs** (chosen), Open Road, Instrument. Open it in a browser. |
| `styles-v1-decorated.css` | The first stylesheet, before the Road Signs rebuild |
| `index-v1-decorated.html` | The first home page |
| `README-v1.md` | The README as it was |

To roll back to the first design, copy `styles-v1-decorated.css` over
`assets/css/styles.css` and `index-v1-decorated.html` over `index.html`, then
run `python tools/sync-chrome.py`.

---

## Content notes — please confirm before going live

Everything on the site was taken from the school's own flyers. Two things are
worth a second look:

1. **Phone numbers.** The flyers carry two different pairs:
   `0755 938383 / 0753 197776` on the branch flyer, and
   `0781 204007 / 0708 251871` on the services banner. The site treats the
   first pair as the main line and WhatsApp number, and the second pair as the
   Nakawa office and permit desk. Swap them if that is the wrong way round.
   All four appear on `contact.html` and in the footer.

2. **Branch descriptions.** Read from the flyer as Kireka (at Sankara
   building), Kiwatule (at the taxi stage), Kyaliwajjala (opposite Pride Bank)
   and Manyangwa (Trading Centre). The flyer print is small — check the
   spellings.

Also outstanding:

- **Testimonials** on `index.html` are placeholders, each marked with a
  "Sample review" chip. Replace the three quotes with real learner words and
  delete the chips.
- **Fees** are deliberately not published; every price points at a phone call.
  If the school wants figures on the site, `courses.html` has a comparison
  table ready for a price column.
- **Domain.** `utraindrivingschool.com` is used as a placeholder in the
  canonical tags, `robots.txt` and `sitemap.xml`. Change it to the real domain
  before launch.

---

## Accessibility & performance

- Skip link, landmark elements, `aria-current` on the active nav item, labelled
  form fields and a visible focus ring (amber, 3px).
- All animation is disabled under `prefers-reduced-motion`.
- A print stylesheet flattens the dark bands so pages print legibly.
- Two web fonts, no JavaScript libraries, and the only images are the six
  photographs and the three flyers — all lazy-loaded below the fold.
