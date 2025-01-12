# Reference Database for Appraisal
Project developed with Next.js 14 App Router

## Project Status
🚧 **Under active development** 🚧

### Currently Working On:
- Strengthening the authentication system with Google
- Optimizing the reference entry form

## Description
Management system for real estate appraisal references with:
- Authentication via Google OAuth 2.0
- Protected admin panel
- Reference management (create/edit)
- PostgreSQL database with Prisma ORM


## Installation and Configuration

1. Clone the repository:
    ```bash
    git clone [repository-url]
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables:
    ```
    POSTGRES_PRISMA_URL=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=
    ```

4. Initialize the database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Known Issues
- On mobile view, next image does not optimize the home image properly
- When creating a new reference, a duplicate success message appears
- Post-login redirection needs optimization
- The creation form needs improved validation

## In Development
- Implementation of robust error handling
- Improvement of form validation system
- Optimization of the authentication flow
- Caching system to improve performance

## Database
We use PostgreSQL + Prisma ORM. The current schema includes:
- **users**: Information of authenticated users
- **referenciales**: Real estate reference data
- **accounts**: OAuth account management

## Contributions
Project inspired by various open-source repositories. Contributions are welcome via pull requests.

## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## System Diagram
![System Diagram](public/images/diagrama_sistema.png)