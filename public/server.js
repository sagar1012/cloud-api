var express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./model/user');
const Customer = require('./model/customer');
const Job = require('./model/job');
const JobApplication = require('./model/jobApply');
const PageContent = require('./model/PageContent');
const Item = require('./model/kioskMenu');
const Weather = require('./model/weather');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
var app = express();
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const functions = require('firebase-functions');

mongoose.connect('mongodb+srv://cloudlab:CloudLabSit01@cluster0.jz0yxet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
    console.log("Successfully connect to MongoDB.");
}).catch(err => {
    console.log(err);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('listening on 3000');
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to demo app' });
});

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init upload
const uploadFile = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Upload endpoint
app.post('/upload', (req, res) => {
    uploadFile(req, res, (err) => {
        if (err) {
            res.status(200).json({ error: err });
        } else {
            if (req.file == undefined) {
                res.status(200).json({ error: 'No file selected!' });
            } else {
                res.json({
                    message: 'File uploaded!',
                    filePath: `/uploads/${req.file.filename}`
                });
            }
        }
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/kioskmenu', async (req, res) => {
    try {
        const item = new Item(req.body);
        await item.save(); res.status(201).send(item);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get all Menuitems
app.get('/kioskmenu', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).send(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update item
app.put('/kioskmenu/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) {
            return res.status(200).send();
        }
        res.send(item);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/kioskmenu/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/weather', async (req, res) => {
    try {
        const weather = await Weather.findOneAndUpdate(
            {}, // Find any document
            req.body, // Update with the request body
            { new: true, upsert: true } // Create a new document if none exists
        );
        res.status(200).json(weather);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read the weather entry
app.get('/weather', async (req, res) => {
    try {
        const weather = await Weather.findOne(); // Find the single document
        if (!weather) return res.status(404).json({ message: 'Weather not found' });
        res.status(200).json(weather);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(200).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        // Send token in response
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get title and description for a specific page
app.get('/page/:pageName', async (req, res) => {
    const { pageName } = req.params;
    try {
        const pageContent = await PageContent.findOne({ page: pageName });
        if (!pageContent) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.status(200).json(pageContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add or update title and description for a specific page
app.post('/page/:pageName', async (req, res) => {
    const { pageName } = req.params;
    const { title, description } = req.body;
    try {
        let pageContent = await PageContent.findOne({ page: pageName });
        if (!pageContent) {
            // If page content doesn't exist, create a new one
            pageContent = new PageContent({
                page: pageName,
                title,
                description,
            });
        } else {
            // Update existing page content
            pageContent.title = title;
            pageContent.description = description;
        }
        await pageContent.save();
        res.status(200).json({ message: 'Page content saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update title and description for a specific page
app.put('/page/:pageName', async (req, res) => {
    const { pageName } = req.params;
    const { title, description } = req.body;
    try {
        let pageContent = await PageContent.findOne({ page: pageName });
        if (!pageContent) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // Update existing page content
        pageContent.title = title;
        pageContent.description = description;

        await pageContent.save();
        res.status(200).json({ message: 'Page content updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Create a new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { fullName, contact, email, company, message } = req.body;

        const newCustomer = new Customer({
            fullName,
            contact,
            email,
            company,
            message
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(200).json({ message: 'Customer with this email already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get customer by ID
app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(200).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update customer by ID
app.put('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete customer by ID
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a job post
app.post('/api/job', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).send(job);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all job posts
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.send(jobs);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a job post by ID
app.put('/api/job/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(job);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a job post by ID
app.delete('/api/job/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.send({ message: 'Job post deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/jobApplications', upload.single('resume'), async (req, res) => {
    try {
        const { title, code, phoneNumber, email, fullName } = req.body;
        const resume = req.file ? req.file.path : '';

        const newJobApplication = new JobApplication({ title, code, phoneNumber, email, resume, fullName });
        await newJobApplication.save();
        res.status(200).json({ message: 'Job application created successfully' });
    } catch (err) {
        console.error(err);

        if (err.code === 11000) { // Duplicate key error code
            return res.status(400).json({ error: 'Code already exists' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/jobApplications', async (req, res) => {

    try {
        const jobApplications = await JobApplication.find();
        res.status(200).json(jobApplications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// app.post('/user', [verifyToken], (req, res) => {
//     const user = new User({
//         email: req.body.email,
//         userName: req.body.userName,
//         password: req.body.password,
//         firstName: req.body.firstName,
//         lastName: req.body.lastName
//     });

//     bcrypt.hash(user.password, 10, function (err, hash) {
//         if (err) {
//             return next(err);
//         }
//         user.password = hash;
//         user.token = jwt.sign({ name: 'sagar' }, 'secret',
//             {
//                 algorithm: 'HS256',
//                 allowInsecureKeySizes: true,
//                 expiresIn: 86400, // 24 hours
//             });
//         user.save().then(data => {
//             res.json({
//                 data: data,
//                 status: 200,
//                 message: 'user successfully added'
//             });
//         }).catch(err => {
//             console.log(err);
//         })
//     })
// })

// app.put('/user', (req, res) => {
//     User.findOneAndUpdate({ _id: req.query.filter }, req.body, { new: true }).then(data => {
//         res.json({
//             data: data,
//             status: 200,
//             message: 'user successfully updated'
//         });
//     }).catch(err => {
//         console.log(err);
//     })
// })

// app.get('/user', [verifyToken], (req, res) => {
//     User.find().then(data => {
//         res.json(data);
//     });
// })

// app.delete('/user', (req, res) => {
//     User.findOneAndDelete({ _id: req.query.filter }).then(data => {
//         res.json({
//             status: 200,
//             message: 'user successfully deleted'
//         });
//     }).catch(err => {
//         console.log(err);
//     })
// })

function verifyToken(req, res, next) {
    console.log('check token');
    next();
}

exports.app = functions.https.onRequest(app);
module.exports = router;




