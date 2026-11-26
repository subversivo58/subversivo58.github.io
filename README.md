# [Subversivo58 Blog](https://subversivo58.github.io)

A personal blog about news, projects, technology, trends, and cyberculture.

This repository contains the source code of the Subversivo58 personal blog, hosted on GitHub Pages.

## About the Project

Subversivo58 is a personal publishing platform built around a custom frontend and a modular architecture. Although hosted on a static website platform, it uses JavaScript modules and purpose-built components to provide dynamic content management and administrative capabilities.

The project explores alternatives to traditional CMS platforms, emphasizing independence, maintainability, open standards, and direct control over its own infrastructure.

## Motivation

This project was created to move beyond the standardization and limitations of traditional content management systems for static websites.

Rather than relying on a conventional CMS, the blog uses its own modules, data management mechanisms, and integrations to build a publishing environment tailored to its requirements.

## Design Principles

- **Platform independence:** avoid unnecessary dependence on traditional CMS platforms.
- **Modularity and maintainability:** organize the application into independent components with clearly defined responsibilities.
- **Open standards:** favor established web standards and interoperable technologies.
- **Minimal external dependencies:** reduce reliance on third-party services and libraries whenever practical.
- **Transparency and user control:** keep data management and application behavior understandable and manageable.
- **Purpose-built solutions:** develop internal components when a custom implementation provides a meaningful technical advantage.

## Implemented Features

### Content Management and Publishing

- Custom administrative interface.
- GitHub OAuth authentication and GitHub API integration.
- Post creation, editing, and deletion.
- Custom WYSIWYG editor.
- Local draft persistence.
- RSS feed generation and updates.

### Image Processing

- Browser-based image processing.
- Image resizing and optimization.
- Compression and WebP conversion.
- Local processing before image persistence or publication.

### Data Persistence

- IndexedDB-based storage.
- Separate data stores for application settings, drafts, media, posts, and other application records.
- Local persistence for content and application data.

### Authentication and Security

- JWT-based authentication for protected administrative operations.
- EdDSA digital signatures using Ed25519 keys.
- Browser-native Web Crypto API for cryptographic operations.
- Credential management through the administrative interface.

### Internationalization

- Multi-language interface.
- Translation resources managed independently from application logic.
- Support for 19 configured languages.

### RSS

- RSS 2.0 feed generation.
- Feed updates integrated with the publishing workflow.
- Post metadata and publication information included in generated feeds.

### Records and Telemetry

- Analytics record submission.
- Visitor feedback submission.
- User-submitted error reports.
- Backend integration for record storage and administrative management.
- JWT-authenticated access to protected record management operations.

### Service Worker

- Request interception and routing.
- Handling of pending record submissions.
- Temporary persistence of pending operations.
- Background synchronization of records with the backend.

## Architecture

The project follows a distributed architecture:

- **Frontend:** static website hosted on GitHub Pages.
- **Application logic:** native JavaScript ES Modules and custom libraries.
- **Local persistence:** IndexedDB.
- **Authentication:** GitHub OAuth and JWT-based mechanisms.
- **Backend services:** Cloudflare Workers.
- **Data storage:** Cloudflare D1 for backend record persistence.

This separation allows the frontend and backend services to evolve independently while maintaining a clear integration boundary.

## Technologies

- HTML5
- CSS3
- JavaScript ES Modules
- Bootstrap
- IndexedDB
- Web Crypto API
- Service Workers
- GitHub API and OAuth
- Cloudflare Workers
- Cloudflare D1
- JSON Web Tokens (JWT)
- EdDSA / Ed25519
- RSS 2.0

## Backend Infrastructure

Cloudflare Workers provide the server-side infrastructure that complements the static frontend. Instead of depending on a single backend application, the project uses independently maintained Workers to handle specific responsibilities.

The backend infrastructure includes:

- **Records management:** receives, stores, and manages analytics, visitor feedback, and user-submitted error reports. Cloudflare D1 provides persistent storage, while JWT authentication protects administrative operations.
- **Authentication intermediary:** handles authentication-related routes and acts as an intermediary between the frontend and authentication services, including OAuth-related operations and JWT token issuance and renewal.
- **Web Push infrastructure:** provides the backend capabilities required for Web Push notifications.

This approach separates backend responsibilities into dedicated services, allowing them to be maintained and evolved independently while providing the frontend with the server-side capabilities it requires.

## Development Roadmap

The project continues to evolve. Planned improvements include:

- Progressive Web App (PWA) capabilities.
- A more complete offline experience.
- Further improvements to application architecture and internal modules.
- Additional backend integrations and administrative capabilities.

## Related Projects

The Subversivo58 blog is part of a broader ecosystem of complementary projects. These repositories provide backend services and infrastructure that extend the capabilities of the main application.

- **[Blog Records](https://github.com/subversivo58/blog-records)** — A Cloudflare Worker backend responsible for receiving, storing, and managing the blog's analytics, visitor feedback, and user-submitted error reports. It uses Cloudflare D1 for persistent storage and JWT authentication for administrative operations.

- **[Web Push Proxy](https://github.com/subversivo58/webpush-proxy)** — A Cloudflare Worker that provides backend infrastructure for Web Push notifications and also acts as the blog's authentication intermediary. It handles authentication-related routes and JWT token issuance and renewal, providing the frontend with the authentication services required by the application.

These projects are maintained separately but are integrated into the development and operation of the Subversivo58 blog.

## Contributing

Contributions are welcome.

Please read the [contribution guide](CONTRIBUTING.md) before submitting changes.

## Acknowledgements

This project makes use of open-source software, libraries, and web technologies. Thanks to their authors and maintainers for making their work available to the community.

## License

MIT License

Copyright (c) 2017 - 2020 Lauro Moraes [[AKA Subversivo58]](https://github.com/subversivo58)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.