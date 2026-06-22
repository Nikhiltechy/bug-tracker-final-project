require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 👈 Added Google SDK

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 📦 User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const JWT_SECRET = process.env.JWT_SECRET;

// 📝 Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// 🔑 Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// 🔐 JWT Middleware (add near top, after imports)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // { id, email, iat, exp }
    next();
  });
};

// 📦 Project Model (add after User model)
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "tester", "user"], default: "user" }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model("Project", ProjectSchema);

// 🚀 POST /api/projects (Create Project)
app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });

    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: "admin" }] // 👈 Creator becomes admin
    });

    await project.save();
    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
});

// 📖 GET /api/projects (List User's Projects)
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
});

// 🔐 Middleware: Verify JWT + Check Project Membership & Role
const requireProjectAccess = (requiredRole) => async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const member = project.members.find(m => m.user.toString() === req.user.id);
    if (!member) return res.status(403).json({ message: "Not a member of this project" });

    const roleLevel = { user: 1, tester: 2, admin: 3 };
    if (roleLevel[member.role] < roleLevel[requiredRole]) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.project = project;
    req.myRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📖 GET /api/projects/:id (View Project)
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');
      
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project", error: err.message });
  }
});

// 👥 POST /api/projects/:id/members (Invite by Email)
app.post('/api/projects/:id/members', authenticateToken, requireProjectAccess('admin'), async (req, res) => {
  try {
    const { email, role = 'user' } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    if (!['admin', 'tester', 'user'].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: "User not found. They must sign up first." });

    const alreadyMember = req.project.members.some(m => m.user.toString() === targetUser._id.toString());
    if (alreadyMember) return res.status(409).json({ message: "User already in this project" });

    req.project.members.push({ user: targetUser._id, role });
    await req.project.save();

    res.status(200).json({ message: "Member added", project: req.project });
  } catch (err) {
    res.status(500).json({ message: "Failed to add member", error: err.message });
  }
});

// 🔄 PATCH /api/projects/:id/members/:userId/role (Update Role)
app.patch('/api/projects/:id/members/:userId/role', authenticateToken, requireProjectAccess('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'tester', 'user'].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const member = req.project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: "Member not found in project" });

    member.role = role;
    await req.project.save();

    res.json({ message: "Role updated", project: req.project });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
});


// 🐛 Bug Schema (add after Project model)
const BugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const Bug = mongoose.model('Bug', BugSchema);

// 🔍 Helper to verify project access & role (inline for bug routes)
const checkProjectRole = async (req, res, next, minRole) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const member = project.members.find(m => m.user.toString() === req.user.id);
    if (!member) return res.status(403).json({ message: 'Not a project member' });
    
    const levels = { user: 1, tester: 2, admin: 3 };
    if (levels[member.role] < levels[minRole]) return res.status(403).json({ message: 'Insufficient permissions' });
    
    req.project = project;
    req.myRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 📖 GET /api/projects/:projectId/bugs (All members can view)
app.get('/api/projects/:projectId/bugs', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const isMember = project?.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const bugs = await Bug.find({ project: req.params.projectId })
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bugs', error: err.message });
  }
});

// ➕ POST /api/projects/:projectId/bugs (Admin & Tester only)
app.post('/api/projects/:projectId/bugs', authenticateToken, (req, res, next) => checkProjectRole(req, res, next, 'tester'), async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const bug = new Bug({
      title, description, status, priority,
      project: req.params.projectId,
      createdBy: req.user.id,
      assignee: assigneeId || null
    });
    await bug.save();
    
    const populated = await Bug.findById(bug._id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create bug', error: err.message });
  }
});

// 🔄 PATCH /api/projects/:projectId/bugs/:bugId (Admin & Tester only)
app.patch('/api/projects/:projectId/bugs/:bugId', authenticateToken, (req, res, next) => checkProjectRole(req, res, next, 'tester'), async (req, res) => {
  try {
    const bug = await Bug.findOne({ _id: req.params.bugId, project: req.params.projectId });
    if (!bug) return res.status(404).json({ message: 'Bug not found' });

    const allowed = ['title', 'description', 'status', 'priority', 'assignee'];
    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) bug[key] = req.body[key];
    });
    await bug.save();
    res.json(bug);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update bug', error: err.message });
  }
});

// 🗑️ DELETE /api/projects/:projectId/bugs/:bugId (Admin & Tester only)
app.delete('/api/projects/:projectId/bugs/:bugId', authenticateToken, (req, res, next) => checkProjectRole(req, res, next, 'tester'), async (req, res) => {
  try {
    const bug = await Bug.findOneAndDelete({ _id: req.params.bugId, project: req.params.projectId });
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    res.json({ message: 'Bug deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete bug', error: err.message });
  }
});

// ==========================================
// 🤖 GEMINI CHAT ENDPOINT WITH DB TOOLS
// ==========================================

// 1. Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Define Tools (Functions the AI can call)
const dbTools = [
  {
    functionDeclarations: [
      {
        name: "get_projects",
        description: "Retrieves the list of projects for the current authenticated user.",
      },
      {
        name: "create_project",
        description: "Creates a new project in the database.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "The name of the project" },
            description: { type: "STRING", description: "The description of the project" }
          },
          required: ["name"]
        }
      },
      {
        name: "update_project",
        description: "Updates an existing project's name or description.",
        parameters: {
          type: "OBJECT",
          properties: {
            projectId: { type: "STRING", description: "The ID of the project to update" },
            name: { type: "STRING", description: "The new name of the project" },
            description: { type: "STRING", description: "The new description of the project" }
          },
          required: ["projectId"]
        }
      }
    ]
  }
];

// 3. Setup the Model with Tools
const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  tools: dbTools 
});

// 4. The Chat Endpoint
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    // Initialize chat session with previous history (if any)
    const chat = chatModel.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
    });

    // Send the initial user message
    let result = await chat.sendMessage(message);
    let response = result.response;

    // 🔄 Loop to handle function calls until the model generates a final text response
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (response.candidates && response.candidates[0].content.parts.some(p => p.functionCall) && iterations < maxIterations) {
      iterations++;
      
      const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
      const functionResponses = [];

      // Execute the requested DB operations
      for (const call of functionCalls) {
        const { name, args } = call.functionCall;
        let output;

        try {
          if (name === 'get_projects') {
            const projects = await Project.find({ "members.user": req.user.id }).select('_id name description createdAt');
            output = { projects };
            
          } else if (name === 'create_project') {
            const project = new Project({
              name: args.name,
              description: args.description,
              createdBy: req.user.id,
              members: [{ user: req.user.id, role: "admin" }]
            });
            await project.save();
            output = { success: true, projectId: project._id, message: "Project created successfully" };
            
          } else if (name === 'update_project') {
            const updateData = {};
            if (args.name) updateData.name = args.name;
            if (args.description) updateData.description = args.description;
            
            const project = await Project.findOneAndUpdate(
              { _id: args.projectId, "members.user": req.user.id }, // Ensures user has access
              updateData,
              { new: true }
            );
            output = project 
              ? { success: true, message: "Project updated successfully", project } 
              : { success: false, message: "Project not found or access denied" };
              
          } else {
            output = { error: "Unknown function called" };
          }
        } catch (dbErr) {
          output = { error: "Database operation failed", details: dbErr.message };
        }

        // Format the response back to the expected SDK structure
        functionResponses.push({
          functionResponse: {
            name,
            response: output
          }
        });
      }

      // Send the function results back to the model so it can formulate a text reply
      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    // Extract the final text response safely
    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    const finalText = textPart ? textPart.text : "I have processed your request.";
    
    res.json({ reply: finalText });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Chat failed", error: err.message });
  }
});

// ==========================================

app.get('/status', (req, res) => res.json({ status: 'running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));