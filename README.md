# The Office Professional Hair Studio

A redesign of [theofficebooking.com](https://www.theofficebooking.com/) for The Office Professional Hair Studio, 37-9665 Bayview Ave, Richmond Hill, ON.

**Preview:** https://jdix22.github.io/the-office/

Plain HTML, CSS and JavaScript. No build step, no frameworks. Every photo is the studio's own, taken from the current website and the Square booking page.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: pinned studio hero (the lights come up as you scroll, then it fades into the page), studio story, full service menu by barber, studio tour video, SMP, Academy, Instagram, Model Program, visit |
| `/smp/` | Scalp micropigmentation: what it is, the three-step process, FAQ, consultation request form |
| `/academy/` | The Office Academy: Benson as educator, Blur the Lines course, course list, student quotes |
| `/blurthelines/`, `/education/` | Forward to the Academy page so the old Squarespace links keep working |

## Booking

Every booking button goes to the studio's real Square Appointments account. Nothing is re-created.

- **Book now** buttons link to `https://book.theofficebooking.com/` (the studio's existing booking site).
- **Book with [barber]** buttons link to that barber's own Square service page.
- On screens wider than 760px the same links open Square's booking flow in a window over the page (Square's official embed). Phones go straight to Square.
- The menu shows all 34 services from Square with their prices and times, as listed on 29 October 2026. If prices change in Square, update the matching rows in `index.html` (search for the barber's name).

Academy links use the studio's Acuity scheduler (`theofficeacademy.as.me`): free consult and course purchase. The Model Program button uses the existing Jotform.

## Instagram feed (Behold)

The "Fresh off the floor" section is wired for a live Instagram feed through [Behold](https://behold.so). Until it is connected, it shows studio photos that link to @theofficehairstudio.

1. Create a free Behold account and connect the @theofficehairstudio Instagram account (the owner signs in to Instagram during this step).
2. Create a feed and choose **JSON** as the feed type.
3. Copy the feed ID (the last part of the feed URL, `https://feeds.behold.so/XXXXXXXX`).
4. Paste it into `assets/site.js` at the top: `var BEHOLD_FEED_ID = 'XXXXXXXX';`

New posts then appear on the site automatically. Reels and carousels get a small icon, and captions show on hover.

## SMP consultation form

There is no server, so the form opens the visitor's email app with the request addressed to the studio. To receive submissions directly instead, create a free [Formspree](https://formspree.io) form and paste its endpoint into `FORM_ENDPOINT` at the top of `assets/site.js`.

## To confirm with the owner

- **Email.** The website lists `theofficehairstudio@gmail.com`; the Square booking page lists `theofficehairstudios@gmail.com` (with an s). This site uses the first. Swap it if the second is the one he checks.
- **Team.** The menu follows Square: Benson, Hugo, Zayd, MJ, Kevin and Anette. Charlie from the old site is no longer bookable in Square, so he is not shown. Anette has no photo yet (a monogram stands in).
- **Kevin's Instagram** is linked as @kvnblends. Worth a quick confirm.
- **Online store.** `store.theofficebooking.com` no longer loads, so the Davines and BaBylissPRO partners are shown without shop links.

## Editing

- Colours, type and layout: `assets/site.css` (tokens at the top).
- Behaviour and settings: `assets/site.js`.
- Images: `assets/img/` (WebP). The hero uses three layers of the same photo: `hero-dim`, `hero-lights` and `hero-full`.

Website designed by [jdix.ca](https://jdix.ca).
