# No Forget Design System

## Direction

No Forget uses a `Morandi Morning Mist` interface: low-saturation color fields, soft atmospheric gradients, quiet typography, and line-based icons. It should feel like opening a calm personal time archive at dawn.

This is a system, not a set of page decorations. Every page, button, icon, card, modal, title, number, and caption should come from these rules.

## Color Tokens

- Canvas: `#F8F4EF`
- Canvas Warm: `#FBF6EF`
- Surface: `rgba(255,255,255,0.72)`
- Surface Strong: `#FFFDF8`
- Hairline: `rgba(205,196,185,0.56)`
- Ink: `#2F2A25`
- Secondary Text: `#7E766B`
- Muted Text: `#AAA094`
- Mist Pink: `#D8B7C8`
- Mist Violet: `#BDB4D8`
- Mist Blue: `#B7CAD8`
- Mist Orange: `#E6B894`
- Mist Sage: `#BBCDBD`
- Danger: `#C86F6B`

## Gradient Strength

- Primary visual fields: 50% opacity mist gradients.
- Secondary cards and strips: 18%-24% opacity mist gradients.
- Empty canvas: 8%-12% opacity same-family gradient washes.
- Avoid hard stops. Use radial or very soft linear gradients with transparent edges.

## Typography

- Global family: `PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`, sans-serif.
- Brand title: `24rpx`, `600`, `4rpx` tracking.
- Page title: `40rpx`, `600`, line height `1.25`.
- Section title: `28rpx`, `600`.
- Body: `26rpx`, `400`, line height `1.65`.
- Caption: `22rpx`, `400`, line height `1.45`.
- Large numbers: serif numeric stack, `112rpx-150rpx`, `300`, tabular numbers.
- Buttons: `27rpx`, `600`, no uppercase English secondary label unless needed.

## Components

- Page background: use `.mist-canvas` style gradients, always soft.
- Cards: translucent surface, hairline border, subtle blur, `28rpx-36rpx` radius.
- Primary button: mist gradient at 50%, white/cream overlay, no heavy saturated fill.
- Secondary button: transparent surface, hairline, muted text.
- Bottom navigation: embedded strip, no capsule, icon-only, 2rpx line icons.
- Modal overlay: center bloom gradient with soft scale-in.
- Empty states: no emoji. Use constructed line/shape marks.

## Icon Rules

- Primary UI icons are line-based, `2rpx-3rpx` stroke, rounded caps.
- Navigation, settings, camera, empty-state, action icons must be one visual family.
- Category emoji may remain only as data labels inside category names until replaced with a full icon library.
- Do not mix filled emoji, stock SVG, and CSS line icons in primary controls.

## Motion

- Page entrance: slow `mist-drift` background movement, 12s-18s.
- Card entrance: light translate-up and fade, 360ms.
- Tap: scale to `0.97`, no bouncy overshoot.
- Modal: `mist-bloom` from center outward.
- Respect reduced motion where possible.

## Page Rules

- Home: mist background, airy cards, embedded bottom nav, no oversized CTA.
- Add/Edit: form fields are quiet lines; bottom action uses mist gradient; delete is muted danger.
- Detail: countdown is the hero, with category tint as atmosphere not a hard block.
- Almanac: same canvas; traditional content is presented in modern mist cards.
- Mine: dashboard and menu groups use same translucent surfaces and line icons.
