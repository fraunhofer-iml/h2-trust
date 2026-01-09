<a id="readme-top"></a>

[![Stars][stars-shield]][stars-url] [![Forks][forks-shield]][forks-url] [![Watchers][watchers-shield]][watchers-url]
[![Contributors][contributors-shield]][contributors-url] [![Commit Activity][commitactivity-shield]][commitactivity-url]
[![Last Commit][lastcommit-shield]][lastcommit-url] [![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<br />
<div align="center">
<h2 align="center">H2-Trust</h2>
  <p align="center">
    A NestJS-based application aimed at tracking hydrogen along the supply chain.
    <br />
    <a href="https://github.com/fraunhofer-iml/h2-trust/issues/new?labels=bug&template=bug-report---.md">🐞 Report Bug</a> &middot;
    <a href="https://github.com/fraunhofer-iml/h2-trust/issues/new?labels=enhancement&template=feature-request---.md">💡 Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">📚 About The Project</a>
      <ul><li><a href="#description">📄 Description</a></li></ul>
      <ul><li><a href="#built-with">🛠️ Built With</a></li></ul>
      <ul><li><a href="#components-overview">🏗️ Components Overview</a></li></ul>
    </li>
    <li><a href="#getting-started">🚀 Getting Started</a></li>
    <li>
      <a href="#contributing">🤝 Contributing</a>
      <ul><li><a href="#getting-involved">🌟 Getting Involved</a></li></ul>
    </li>
    <li><a href="#license">📜 License</a></li>
    <li><a href="#contact">📬 Contact</a></li>
    <li><a href="#acknowledgments">🙏 Acknowledgments</a></li>
  </ol>
</details>

## 📚 About The Project <a id="about-the-project"></a>

### 📄 Description <a id="description"></a>

H2-Trust is our hydrogen product passport, developed as part of the research project DUH-IT. Our goal is to create a
solution for automated, transparent, and tamper-proof verification of hydrogen properties throughout the entire supply
chain.

### 🛠️ Built With <a id="built-with"></a>

- [![Angular][angular-shield]][angular-url] Framework for building dynamic web applications
- [![Docker][docker-shield]][docker-url] Platform for containerizing and deploying applications efficiently
- [![ESLint][eslint-shield]][eslint-url] Utility for linting and enforcing code quality in JavaScript and TypeScript
- [![Jest][jest-shield]][jest-url] JavaScript testing framework
- [![Keycloak][keycloak-shield]][keycloak-url] Identity and access management solution
- [![MinIO][minio-shield]][minio-url] S3-compatible object storage
- [![NestJS][nestjs-shield]][nestjs-url] Node.js framework for building scalable server-side applications
- [![Nx][nx-shield]][nx-url] Build system for monorepos
- [![PostgreSQL][postgresql-shield]][postgresql-url] Relational database management system known for reliability and
  performance
- [![Prettier][prettier-shield]][prettier-url] Code formatter for consistent style
- [![Prisma][prisma-shield]][prisma-url] ORM for database management
- [![RabbitMQ][rabbitmq-shield]][rabbitmq-url] Message broker for distributed systems, supporting AMQP
- [![RxJS][rxjs-shield]][rxjs-url] Library for managing asynchronous events
- [![Swagger][swagger-shield]][swagger-url] Tools for designing and documenting APIs
- [![TailwindCSS][tailwindcss-shield]][tailwindcss-url] CSS framework for building custom designs
- [![TypeScript][typescript-shield]][typescript-url] Strongly typed programming language that enhances JavaScript

### 🏗️ Components Overview <a id="components-overview"></a>

The project consists of the following components:

1. **Frontend (`frontend`)**

   - Allows users to manage units and track hydrogen batches.

2. **API Gateway (`api`)**

   - Handles all incoming HTTP requests and routes them to the appropriate services via AMQP.

3. **General Service (`general-svc`)**

   - Manages master data.

4. **Process Service (`process-svc`)**

   - Manages hydrogen batches and their process steps and handles workflows.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🚀 Getting Started <a id="getting-started"></a>

TLDR: open two terminal windows and run in one terminal window `docker-compose up` and in the other terminal window
`npm install && npm run init && npm run dev`.

For a more detailed explanation of how to get a development environment running, including all prerequisites, please
consult the chapters [Deployment View](./documentation/04-deployment-view.adoc) and
[Tutorial](./documentation/05-tutorial.adoc) in our documentation. These two chapters provide step-by-step instructions
to guide you through the process of installing, configuring and running H2-Trust on your local machine.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🤝 Contributing <a id="contributing"></a>

### 🌟 Getting Involved <a id="getting-involved"></a>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any
contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add something amazing'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📜 License <a id="license"></a>

Licensed under the Apache License 2.0. See `LICENSE` for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📬 Contact <a id="contact"></a>

Dominik Sparer: dominik.sparer@iml.fraunhofer.de

Michael Pichura: michael.pichura@iml.fraunhofer.de

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🙏 Acknowledgments <a id="acknowledgments"></a>

- [wait-for-it](https://github.com/vishnubob/wait-for-it) for providing the `wait-for-it.sh` script, which is included
  unmodified in this project under the terms of the
  [MIT License](https://github.com/vishnubob/wait-for-it/blob/master/LICENSE)
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template) provided inspiration and structure for
  creating this README file
- [Img Shields](https://shields.io) enabled the creation of customizable and visually appealing badges for this project

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[stars-shield]: https://img.shields.io/github/stars/fraunhofer-iml/h2-trust.svg?style=for-the-badge
[stars-url]: https://github.com/fraunhofer-iml/h2-trust/stargazers
[forks-shield]: https://img.shields.io/github/forks/fraunhofer-iml/h2-trust.svg?style=for-the-badge
[forks-url]: https://github.com/fraunhofer-iml/h2-trust/forks
[watchers-shield]: https://img.shields.io/github/watchers/fraunhofer-iml/h2-trust?style=for-the-badge
[watchers-url]: https://github.com/fraunhofer-iml/h2-trust/watchers
[contributors-shield]: https://img.shields.io/github/contributors/fraunhofer-iml/h2-trust.svg?style=for-the-badge
[contributors-url]: https://github.com/fraunhofer-iml/h2-trust/graphs/contributors
[commitactivity-shield]: https://img.shields.io/github/commit-activity/y/fraunhofer-iml/h2-trust?style=for-the-badge
[commitactivity-url]: https://github.com/fraunhofer-iml/h2-trust/graphs/commit-activity
[lastcommit-shield]: https://img.shields.io/github/last-commit/fraunhofer-iml/h2-trust?style=for-the-badge
[lastcommit-url]: https://github.com/fraunhofer-iml/h2-trust/commits/main
[issues-shield]: https://img.shields.io/github/issues/fraunhofer-iml/h2-trust.svg?style=for-the-badge
[issues-url]: https://github.com/fraunhofer-iml/h2-trust/issues
[license-shield]: https://img.shields.io/github/license/fraunhofer-iml/h2-trust.svg?style=for-the-badge
[license-url]: https://github.com/fraunhofer-iml/h2-trust/blob/main/LICENSE
[angular-shield]: https://img.shields.io/badge/Framework-Angular-DD0031?style=flat&logo=angular
[angular-url]: https://angular.io/
[docker-shield]: https://img.shields.io/badge/Platform-Docker-2496ED?style=flat&logo=docker
[docker-url]: https://www.docker.com/
[eslint-shield]: https://img.shields.io/badge/Linting-ESLint-4B32C3?style=flat&logo=eslint
[eslint-url]: https://eslint.org/
[jest-shield]: https://img.shields.io/badge/Testing-Jest-C21325?style=flat&logo=jest
[jest-url]: https://jestjs.io/
[keycloak-shield]: https://img.shields.io/badge/Library-Keycloak-DC382D?style=flat&logo=keycloak
[keycloak-url]: https://www.keycloak.org/
[minio-shield]: https://img.shields.io/badge/Storage-MinIO-FF6F00?style=flat&logo=minio
[minio-url]: https://min.io/
[nestjs-shield]: https://img.shields.io/badge/Framework-NestJS-E0234E?style=flat&logo=nestjs
[nestjs-url]: https://nestjs.com/
[nx-shield]: https://img.shields.io/badge/Tool-Nx-DD0031?style=flat&logo=nrwl
[nx-url]: https://nx.dev/
[postgresql-shield]: https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql
[postgresql-url]: https://www.postgresql.org/
[prettier-shield]: https://img.shields.io/badge/Formatting-Prettier-F7B93E?style=flat&logo=prettier
[prettier-url]: https://prettier.io/
[prisma-shield]: https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma
[prisma-url]: https://www.prisma.io/
[rabbitmq-shield]: https://img.shields.io/badge/Message_Broker-RabbitMQ-FF6600?style=flat&logo=rabbitmq
[rabbitmq-url]: https://www.rabbitmq.com/
[rxjs-shield]: https://img.shields.io/badge/Library-RxJS-B7178C?style=flat&logo=reactivex
[rxjs-url]: https://rxjs.dev/
[swagger-shield]: https://img.shields.io/badge/API-Swagger-85EA2D?style=flat&logo=swagger
[swagger-url]: https://swagger.io/
[tailwindcss-shield]: https://img.shields.io/badge/CSS_Framework-TailwindCSS-06B6D4?style=flat&logo=tailwindcss
[tailwindcss-url]: https://tailwindcss.com/
[typescript-shield]: https://img.shields.io/badge/Language-TypeScript-007ACC?style=flat&logo=typescript
[typescript-url]: https://www.typescriptlang.org/
