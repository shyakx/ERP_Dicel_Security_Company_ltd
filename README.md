# **Enterprise Resource Planning (ERP) System**

## 🚀 **Project Overview**
This **ERP System** is built to streamline business operations, managing **employees, departments, assets, invoices, projects, and finances** efficiently. The system provides an intuitive **Bootstrap-based UI** for easy navigation and control and beautiful charts.

---

## 📌 **Features**
- **User Authentication**: Secure login for employees and admins
- **Employee Management**: Manage employee records, roles, and departments
- **Department Management**: Organize company structure
- **Asset Tracking**: Monitor company-owned assets
- **Invoice Management**: Create, track, and manage invoices
- **Project & Task Management**: Assign tasks, deadlines, and track progress
- **Attendance & Leave Management**: Employees can mark attendance and request leave
- **Reports & Analytics**: Generate business insights

---

## 🎨 **Screenshots**

### **Dashboard View**
<img width="945" alt="image" src="https://github.com/user-attachments/assets/21033eca-1e2f-434e-950c-cc5aa5abf9e5" />


---

## 🛠 **Tech Stack**

- **Frontend**: HTML, CSS, Bootstrap, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL / PostgreSQL
- **Icons & UI Components**: Bootstrap Icons, FontAwesome

---

## 📂 **Project Structure**

```bash
ERP-System/
│── backend/           # Server-side API (Node.js, Express, Database models)
│── frontend/          # UI and frontend logic (HTML, CSS, Bootstrap, JavaScript)
│── docs/              # Documentation, Screenshots, ERD, UML diagrams
│── README.md          # Project documentation
│── package.json       # Dependencies & scripts
│── .env               # Environment variables (database config)
│── server.js          # Main backend server file

🚀 Installation & Setup
1️⃣ Clone the Repository
sh
```bash
git clone https://github.com/shyakx/ERP_Dicel_Security_Company_ltd.git
cd ERP_Dicel_Security_Company_ltd
```
2️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if applicable)
cd ../frontend
npm install
```
3️⃣ Configure Environment
Create a .env file in the backend folder with the following:

```bash
DB_HOST=your_database_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=erp_db
PORT=5000

```
4️⃣ Run the Application
```bash
# Start Backend
cd backend
npm run dev

# Start Frontend (if applicable)
cd ../frontend
npm run start
```
✅ Contributing
Fork the repository
Create a new branch: git checkout -b feature-branch
Commit changes: git commit -m "Added feature XYZ"
Push to the branch: git push origin feature-branch
Submit a pull request
📄 License
This project is licensed under the MIT License.
