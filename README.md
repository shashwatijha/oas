
# OAS – Online Auction System

Welcome to the OAS project! This guide will help you get the project up and running on your local machine.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shashwatijha/oas.git
```

---

### 2. Install Required Tools

- [VS Code](https://code.visualstudio.com/)
- [MySQL Server (Windows)](https://dev.mysql.com/downloads/windows/installer/8.0.html)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
---

### 3. Open the Project in VS Code

```bash
cd OAS
code .
```

---

### 4. Set Up Python Virtual Environment

```bash
cd server
python -m venv venv

# Activate virtual environment:
# macOS/Linux
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

---

### 5. Install Backend Dependencies, not done yet

```bash
pip install -r requirements.txt
```

---

### 6. Run the Flask Server

```bash
cd server
python server.py
```
```to run the reactjs
    npm install
    npm start
```
Server will run on: [http://localhost:8000](http://localhost:8000)

---



### 7. Set Up MySQL Database

- Open MySQL Workbench
- Run the following SQL:

```sql
CREATE DATABASE aos;
USE aos;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

you may also need to update your sql connection details in app.py

> You can also import a provided `schema.sql` file if available.

---

### 8. Test Login (Optional)

Use the following test credentials (if seeded):

```text
email: test@example.com
password: test123
```

---

### Tips

- Always pull the latest changes from `main`
- Create a new branch for each feature
- Open a Pull Request via GitHub UI and assign a reviewer
- Never push directly to `main`


