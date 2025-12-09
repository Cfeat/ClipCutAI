# ClipCut AI

ClipCut AI is a professional-grade, web-based video editor built with React, TypeScript, and Vite. It seamlessly integrates Google's latest Generative AI models (Gemini & Veo) to empower creators to generate scripts, images, and video assets directly within the editing workflow.

## Features

- **Multi-track Timeline**: robust timeline supporting Video, Audio, Image, and Text tracks with layering capabilities.
- **Generative AI Integration**:
  - **Text-to-Image**: Generate assets instantly using `gemini-2.5-flash-image`.
  - **Text-to-Video**: Create video clips using `veo-3.1-fast-generate-preview`.
  - **Scriptwriting**: Generate creative video scripts using `gemini-2.5-flash`.
- **Real-time Preview**: Smooth canvas playback with support for mixed media types.
- **Property Inspector**: Fine-tune clip properties such as Scale, Rotation, Opacity, and Position (X/Y).
- **Asset Management**: Unified library for uploaded media and AI-generated content.
- **Drag & Drop**: Intuitive drag-and-drop interface for placing assets onto the timeline.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Google API Key** with access to Gemini models.

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory of the project. You can copy the example file:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Google API Key:
   ```env
   API_KEY=your_actual_api_key_here
   ```

   > **Important**: For Video Generation (Veo models), your API Key must be associated with a Google Cloud project that has billing enabled.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Launch**
   Open your browser and navigate to `http://localhost:5173`.

## Usage Guide

### 1. Asset Library
- **Media Tab**: Click the upload area to add local video or image files.
- **AI Generator Tab**:
  - Select **Image**, **Video**, or **Script**.
  - Enter a prompt describing what you want to create.
  - Click **Generate with Gemini**.
  - Generated media is automatically added to your asset list.

### 2. Timeline Editing
- **Add Clips**: Drag items from the Asset Library onto the timeline.
- **Move Clips**: Drag clips left or right to adjust their start time.
- **Layers**: Video/Image tracks are layered. The topmost track on the timeline (visually) renders on top.
- **Navigation**: Click the timeline ruler to seek. Use the Zoom buttons or scroll to zoom in/out.

### 3. Clip Properties
- Click any clip on the timeline to select it.
- Use the **Properties Panel** on the right to adjust:
  - **Transform**: Scale, Rotation, Opacity.
  - **Content**: Edit text content for text overlays.
  - **Delete**: Remove clips from the timeline.

## Project Structure

- `src/components`: UI components (Player, Timeline, Sidebar).
- `src/services`: API integration logic for Google GenAI.
- `src/types`: TypeScript definitions for Project, Track, and Clip models.
- `src/constants`: Configuration for timeline behavior and default tracks.

## License

MIT
