# **App Name**: Vizura RPG Companion

## Core Features:

- Firebase Authentication: Implement user sign-up and sign-in using email/password and Google authentication, with protected routes for authenticated users.
- Dashboard Overview: Main landing page displaying a customizable hero image, title, description, and recent characters.
- Character Creator: Multi-column page for character creation, including name, race, class, background, stats (point-buy and dice roll), and AI-generated backstories and appearances tool.
- Character Sheets: Detailed view of a single character, displaying portrait, stats, vitality, skills, feats, and inventory.
- Character Gallery: Grid-based gallery displaying all created characters with portraits and basic info, linking to individual sheets.
- Inventory System: Inventory management page with drag-and-drop functionality, 'Carried Items' area, equippable container slots, weight calculation, and encumbrance limit display.
- Campaign & Combat Pages: Campaign management page with session date, 'Solo Mode' switch, and in-game time. Combat page for making attack rolls, selecting difficulty, rolling dice, and displaying results in a log.
- Admin Section: Admin area with Kanban-style project board to manage development tasks, using 'To Do', 'In Progress', and 'Done' columns, with an AI task generator tool based on a high-level objective, tasks stored in Firestore.

## Style Guidelines:

- Primary color: Golden Yellow (#FFD700) to evoke a sense of fantasy and adventure.
- Background color: Dark gray (#282828) for a dark fantasy theme.
- Accent color: Slightly more orange than the primary (#E4B300) to bring contrast to highlights and active elements.
- Headline font: 'MedievalSharp' (serif) for titles and headings to match the fantasy theme. Note: currently only Google Fonts are supported.
- Body font: 'Inter' (sans-serif) for body text for readability. Note: currently only Google Fonts are supported.
- Use fantasy-themed icons for navigation and feature representation.
- Use ShadCN UI components for a modern and accessible interface.
- Subtle transitions and animations for user interactions.