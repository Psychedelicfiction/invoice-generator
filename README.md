# Invoice Generator

A full-stack web application for generating, saving, and emailing professional invoices. Built with **React**, **Next.js**, **Node.js**, and **Express**, the app allows users to fill out dynamic invoice forms, generate PDFs, and send invoices via email with attachments.

## Features

- Create and preview invoices with a responsive UI  
- Generate invoice PDFs using `jsPDF` and `html2canvas`  
- Send invoices via email with PDF attachments using `nodemailer`  
- Save invoices to a backend server  
- View invoice history  
- Client-side validation and toast notifications  
- Mobile-friendly design  

## Tech Stack

**Frontend**  
- React  
- Next.js  
- TypeScript  
- Tailwind CSS  
- html2canvas  
- jsPDF  

**Backend**  
- Node.js  
- Express  
- MongoDB  
- Nodemailer  

## Getting Started

### Prerequisites

- Node.js and npm installed  
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/invoice-generator.git
cd invoice-generator
```
2. **Install dependencies**

```bash
//For frontend
cd client
npm install

//For backend
cd ../server
npm install
```
3. **Set environment variables**
Backend .env:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
```
Frontend .env.local:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```


4. **Run development servers**

```bash
//In /server
npm run dev

//In /client
npm run dev
```
