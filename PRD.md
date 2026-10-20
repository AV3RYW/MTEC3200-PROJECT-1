# Product Requirements Document: Puzzle Alarm MVP

**Status:** Draft  
**Date:** October 18, 2026  
**Product name:** Working title — Puzzle Alarm

## Project Overview

Puzzle Alarm is a simple morning alarm web app for people who repeatedly snooze, fall back asleep, and end up rushing through their morning. At the scheduled time, the app plays an alarm and presents a short brain teaser. The user must solve it to dismiss the alarm, creating a deliberate reason to engage and get mentally active rather than dismissing an alarm while still half-asleep.

The MVP focuses on setting one reliable, recurring alarm and completing a puzzle to turn it off. It will also give the user a brief, supportive indication of whether they woke up at the time they planned. It will not attempt to manage sleep schedules or shame users for oversleeping.

Research supporting this direction:

- Two of three interviewees described repeatedly snoozing alarms and struggling to get ready on time.
- Interviewees said oversleeping can lead them to skip parts of their morning routine or rush to avoid being late.
- The routine audit and What / How / Why exercise connect lost preparation time to stress and frustration.
- Research also raised bedtime guidance, social streaks, and “what you missed” feedback, but these are not necessary to test the core puzzle-alarm idea.

## Target Users

People who have trouble getting out of bed at their intended time, especially those who repeatedly snooze or turn off alarms and fall back asleep. The initial use case is a student or worker with a planned morning routine and a time they need to leave for class, work, or another commitment.

### User need

When my alarm goes off, I want a simple way to make myself engage before I dismiss it, so I can start my morning closer to the time I planned and avoid rushing.

## Goals and Success Criteria

### MVP goals

- Let a user configure and save a recurring alarm without creating an account.
- Make the alarm require completion of a puzzle before it can be dismissed.
- Make the alarm state and puzzle interaction understandable and usable on a phone-sized screen.
- Record whether the user dismissed the alarm within a short, clearly defined window after the scheduled time, and show a neutral, encouraging result.

### How to evaluate the MVP

In a small usability test, confirm that users can set an alarm, understand when it will repeat, and dismiss a ringing alarm only after solving the puzzle. Ask whether the puzzle made them feel more alert and whether they would use the app for another morning. Track alarm setup completion, puzzle completion, and on-time dismissal during testing.

These are evaluation measures, not claims that the MVP will improve sleep, punctuality, or health.

## Skills Required

- Next.js (required; already used by the project)
- React and TypeScript
- Responsive UI styling with the project's existing Tailwind CSS setup
- Browser time, audio, and local storage APIs
- Vercel deployment (required by the project plan)
- Basic accessibility and mobile web testing

## Key Features

The app has three primary views: a home screen, alarm settings, and the active alarm/puzzle screen.

### 1. Home screen

- Show the current time and the next configured alarm, if one exists.
- Provide a single, prominent route to alarm settings.
- Make it clear whether the alarm is enabled.

### 2. Alarm settings

- Let the user set an alarm time.
- Let the user choose which days it repeats; a one-time alarm may be represented by selecting no repeat days.
- Let the user choose a puzzle difficulty: easy, medium, or hard.
- Let the user save, edit, enable, and disable the alarm.
- Explain that the browser must be open and the device available for the web MVP to trigger the alarm.

### 3. Active alarm and puzzle

- At the configured time, show the alarm screen and play an alarm sound when browser policies allow it.
- Present a puzzle at the selected difficulty and accept an answer.
- Keep the alarm active after an incorrect answer and provide a way to try again.
- Stop the alarm only after a correct answer or an explicit emergency stop action. The emergency stop must be available for usability and safety; using it should count as not completing the puzzle for the on-time result.
- After dismissal, show a brief, non-judgmental message indicating whether the alarm was dismissed within the MVP's on-time window.

### MVP requirements and acceptance criteria

- Alarm settings persist after the user refreshes or reopens the same browser.
- The selected time and repeat days are displayed clearly before saving.
- A ringing alarm cannot be dismissed by tapping outside the puzzle or submitting an incorrect answer.
- Correct and incorrect answers produce distinct, understandable feedback.
- The user can stop the alarm without solving if necessary.
- Alarm, settings, and puzzle screens can be used on a narrow mobile viewport and with keyboard navigation.
- The interface does not claim to guarantee waking the user if the browser or device prevents background execution.

### Out of scope for the MVP

- Bedtime tracking, sleep-duration calculations, or recommendations about when to go to bed.
- Accounts, cloud sync, and social sharing.
- Streaks, leaderboards, or gamification beyond solving the alarm puzzle.
- “What you missed” calculations or guilt-based negative feedback.
- AI-generated puzzles or other user-facing AI features.
- Native mobile apps or a guarantee that alarms work while the browser is closed, the device is asleep, or the operating system restricts background activity.

## Milestones

### Milestone 1 — Alarm setup and home screen

- Build the home screen and settings screen.
- Implement time, repeat-day, difficulty, enabled/disabled, and saved-alarm states.
- Persist alarm settings in the browser.
- Verify setup and editing on desktop and mobile-sized layouts.

### Milestone 2 — Puzzle alarm and MVP evaluation

- Implement alarm scheduling for an open, active browser session, including the alarm screen, sound, puzzle answer checking, retry, and emergency stop.
- Implement the post-alarm on-time result.
- Test the complete flow, keyboard access, refresh persistence, and browser permission/restriction messaging.
- Run a small usability test and use the results to decide whether the puzzle interaction is clear and motivating.

## Open Questions

- Is a browser-based alarm sufficient for the first MVP, or must it work when the browser is closed or the device is locked? Reliable background alarms may require a native app or platform-specific capabilities.
- What is the default on-time window after the scheduled alarm time? A prototype can start with five minutes and validate this with users.
- Should the MVP support multiple alarms, or is one alarm enough to test the core behavior?
- What puzzle types and answer formats are understandable immediately after waking (for example, arithmetic, pattern recognition, or word puzzles)?
- Should users be able to change or silence the alarm sound?
- What visual style and product name should be used?
