//<<-------------------Import packages------------------>>
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const http = require('http');

//<<-------------------------App uses--------------------->>
const app = express();
const server = http.createServer(app); // Create an HTTP server

app.use("/views", express.static('views'));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//<<--------------------Data base connetion------------------------>>
mongoose.connect("mongodb://127.0.0.1:27017/guest", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
  fullName: String,
  dateOfBirth: Date,
  email: String,
  mobileNumber: String,
  gender: String,
  occupation: String,
  // Add more fields for address and fitness details
  addressType: String,
  nationality: String,
  state: String,
  district: String,
  houseNumber: String,
  pinCode: String,
  amount:String,
  plan:{
 default:null,
 type:String
  },

  exerciseIntensity: String,
  goal: String,
  foodHabit: String,
  physicalActivity: String,
  medicalHistory: String,
  currentMedication: String,
  healthIssues: String,
  expectationFromConsultation: String,
  measurements: String,
  dailyWorkout: String,
  workoutDaysPerWeek: String,
  exerciseContraindication: String,
  password: String,
  displayName: String,
  googleId: String,
  username: {
    type: String,
    unique: false // Disable the unique constraint
  },
  query:String,
  morning: String,
  midMorning: String,
  lunch: String,
  afternoon: String,
  snack: String,
  evening: String,
  dinner: String,
  notes: String,

  
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date,
  },

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

//<<-----------Google Authentication------------->>
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      if (err) {
        console.error(err);
      }

      // Store the Google profile data in the user document
      user.displayName = profile.displayName;
      user.save(function (err) {
        if (err) {
          console.error(err);
        }
        return cb(err, user);
      });
    });
  }));

  app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

  // <<-------Roots to files-------->>
app.get("/home", function (req, res) {
  res.render("home");
});
app.use("/img", express.static('img'));
app.use("/userdash", express.static('userdash'));

app.get("/form", (req, res) => {
  res.render("form");
})

app.get("/about", (req, res) => {
  res.render("aboutus");
})


app.get("/home", function (req, res) {
  res.render("home");
});


app.get("/register", function (req, res) {
  res.render("register");
});


app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/termscondition", function (req, res) {
  res.render("termsandcondition");
});

// Example route where you render the EJS template:
app.get("/", function (req, res) {
  res.render("index", { isLoggedIn: req.session.isLoggedIn }); // Pass the isLoggedIn variable
});
app.get("/index", function (req, res) {
  res.render("index", { isLoggedIn: req.isAuthenticated() }); // Pass the isLoggedIn variable
});

// <<---------Login Form------------>>
app.post("/login", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // Use Passport's local authentication strategy
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error(err);
      // Handle error, e.g., display an error message
      return res.render("login", { errorMessage: "An error occurred. Please try again later." });
    }

    if (!user) {
      // Authentication failed, user not found or incorrect password
      // Redirect back to the login page with an error message
      return res.render("login", { errorMessage: "Invalid username or password." });
    }

    // If authentication is successful, log in the user
    req.logIn(user, function (err) {
      if (err) {
        console.error(err);
        // Handle error, e.g., display an error message
        return res.render("login", { errorMessage: "An error occurred. Please try again later." });
      }
      // Redirect to a protected page (e.g., "/secrets") after successful login
      return res.redirect("/index");
    });
  })(req, res);
});


// <<-------------Register Form--------------->>
app.post("/register", function (req, res) {
  // Check if the username already exists in the database
  User.findOne({ username: req.body.username }, function (err, existingUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      if (existingUser) {
        // Username is already taken; show an alert
        var alertMessage = "Username already registered.";
        res.render("register", { alertMessage: alertMessage });
      } else {
        // Username is not taken; proceed with registration
        User.register({ username: req.body.username , email:req.body.email }, req.body.password, function (err, user) {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, function () {
              res.redirect("/index");
            });
          }
        });
      }
    }
  });
});

// <<-------- App running port ------------->>
// Define the starting port and maximum number of attempts
const startingPort = 3000;
const maxAttempts = 10;

// Function to find an available port
function findAvailablePort(port, maxAttempts, callback) {
  let attempts = 0;

  function tryPort(port) {
    if (attempts >= maxAttempts) {
      console.error(`Could not find an available port after ${maxAttempts} attempts.`);
      process.exit(1);
    }

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      callback(port);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        attempts++;
        tryPort(port + 1);
      }
    });
  }

  tryPort(port);
}

// Start the server on an available port
findAvailablePort(startingPort, maxAttempts, (port) => {
  console.log(`Server started on port http://localhost:${port}.`);
});


// <<----------- Logout ----------------->>

app.get("/logout", function (req, res) {
  // Use req.logout() with a callback function
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    // After logout, you can clear the user's session or perform other actions if needed
    req.session.isLoggedIn = false; // Assuming you're using sessions for authentication
    res.redirect("/");
  });
});





// ================================== User DashBoard Forms ==============================


app.get("/add-info", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("form");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function (req, res) {
  // Extract the submitted data from the request body
  const {
    fullName,
    dateOfBirth,
    email,
    mobileNumber,
    gender,
    occupation,
    addressType,
    nationality,
    state,
    district,
    houseNumber,
    pinCode,
    exerciseIntensity,
    goal,
    foodHabit,
    physicalActivity,
    medicalHistory,
    currentMedication,
    healthIssues,
    expectationFromConsultation,
    measurements,
    dailyWorkout,
    workoutDaysPerWeek,
    exerciseContraindication,
  } = req.body;

  // Find the user by their ID
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Update the user's fields with the submitted data
        foundUser.fullName = fullName;
        foundUser.dateOfBirth = dateOfBirth;
        foundUser.email = email;
        foundUser.mobileNumber = mobileNumber;
        foundUser.gender = gender;
        foundUser.occupation = occupation;
        foundUser.addressType = addressType;
        foundUser.nationality = nationality;
        foundUser.state = state;
        foundUser.district = district;
        foundUser.houseNumber = houseNumber;
        foundUser.pinCode = pinCode;
        foundUser.exerciseIntensity = exerciseIntensity;
        foundUser.goal = goal;
        foundUser.foodHabit = foodHabit;
        foundUser.physicalActivity = physicalActivity;
        foundUser.medicalHistory = medicalHistory;
        foundUser.currentMedication = currentMedication;
        foundUser.healthIssues = healthIssues;
        foundUser.expectationFromConsultation = expectationFromConsultation;
        foundUser.measurements = measurements;
        foundUser.dailyWorkout = dailyWorkout;
        foundUser.workoutDaysPerWeek = workoutDaysPerWeek;
        foundUser.exerciseContraindication = exerciseContraindication;

        // Save the updated user document
        foundUser.save(function () {
          res.redirect("/account");
        });
      }
    }
  });
});


// <<------------------- User Dashboard ---------------------->>
app.get("/account",checkSubscription, function (req, res) {
  // Check if the user is authenticated (logged in)
  if (req.isAuthenticated()) {
    // Find the user by their ID
    User.findById(req.user.id, function (err, foundUser) {
      if (err) {
        console.log(err);
        res.redirect("/login"); // Redirect to a secrets page or handle the error as needed
      } else {
        if (foundUser) {
          
          res.render("account", { user: foundUser });
        }
      }
    });
  } else {
    res.redirect("/login"); // Redirect to the login page if the user is not authenticated
  }
});

// <<------------ Admin Dashboard ------------->>
app.get("/admin", async function (req, res) {
  try {
    // Fetch all users from the database
    const allUsers = await User.find({});
    const totalUserCount = allUsers.length;

    // Filter users based on the plan
    const filteredUsers = allUsers.filter(user => ["basic", "premium", "diamond"].includes(user.plan));

    // Get the count of filtered users
    const userCount = filteredUsers.length;

    // Filter users with a query
    const usersWithQuery = allUsers.filter(user => user.query);

    // Get the count of users with a query
    const queryUserCount = usersWithQuery.length;

    // Render the 'admin' view and pass the users and counts to the view
    res.render("admin", { users: filteredUsers, userCount, totalUserCount, queryUserCount, allUsers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// ====================== Admin Provides Plans =====================
app.post('/addInfo/:id', async (req, res) => {
  const { id } = req.params;
  const { morning, midMorning, lunch,afternoon,snack ,  evening,dinner,notes} = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the user's information
    user.morning = morning;
    user.midMorning = midMorning;
    user.lunch = lunch;
    user.afternoon = afternoon;
    user.snack = snack;
    user.evening = evening;
    user.dinner = dinner; 
    user.notes = notes;


    // Save the updated user
    await user.save();

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});


// ========================================
// Handle GET request to edit user information
app.get("/edit/:userId", function (req, res) {
  const userId = req.params.userId;

  // Fetch the user's information from the database based on userId
  User.findById(userId, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/admin"); // Handle error appropriately
    } else {
      // Render an edit form with the user's existing information
      res.render("plan", { user: foundUser });
    }
  });
});


// Handle POST request to update user information
app.post("/edit/:userId", function (req, res) {
  const userId = req.params.userId;

  const updatedInfo = {
    // Extract and update fields based on form data
    plan: req.body.plan, // Corrected syntax
  };

  // Update the user's information in the database
  User.findByIdAndUpdate(userId, updatedInfo, function (err, updatedUser) {
    if (err) {
      console.log(err);
      res.redirect("/edit/" + userId); // Handle error appropriately
    } else {
      res.redirect("/admin"); // Redirect back to the user information page
    }
  });
});


// Configure body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));






//===========================Logout & register button Start===================================
app.get("/auth/google/secrets", passport.authenticate('google', { 
  failureRedirect: "/login" 
}), function (req, res) {
  req.session.isLoggedIn = true;
  console.log("isLoggedIn set to true");
  res.redirect("/index"); 
});


app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    req.session.isLoggedIn = false; 
    res.redirect("/");
  });
});



app.get("/index", function (req, res) {
  User.find({ "index": { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("index", { isLoggedIn: req.session.isLoggedIn, usersWithSecrets: foundUsers });
      } else {
        res.render("index", { isLoggedIn: req.session.isLoggedIn });
      }
    }
  });
});
app.get("/", function (req, res) {
  res.render("index", { isLoggedIn: req.session.isLoggedIn });
});

app.get("/mytemplate", (req, res) => {
  res.render("home"); 
});
//===========================Logout & register button End===================================

//esnuse authenticated user
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, continue to the next middleware/route
  } else {
    // User is not authenticated, redirect to the home page or any other page
    res.redirect("/");
  }
}

app.get("/index", ensureAuthenticated, function (req, res) {
  User.find({ "index": { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("index", { usersWithSecrets: foundUsers });
      }
    }
  });
});










app.post("/query", function (req, res) {
  // Extract the submitted data from the request body
  const {
    query
  } = req.body;

  // Find the user by their ID
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Update the user's fields with the submitted data
        foundUser.query = query;

        // Save the updated user document
        foundUser.save(function () {
          res.redirect("/account");
        });
      }
    }
  });
}); 

// Inside your Express app
app.post("/remove-query/:userId", async function(req, res) {
  try {
      const userId = req.params.userId;

      // Assuming you have a User model with a query field
      // You should replace this with your actual model and field names
      await User.findByIdAndUpdate(userId, { query: null });

      res.redirect("/admin"); // Redirect back to the admin page
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});




const adminschema = new mongoose.Schema({
  username: String,
  password: String
});

const Collection2 = mongoose.model('Admindb', adminschema);


app.use(express.json());

app.post('/adminlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Collection2.findOne({ username, password }).exec();

    if (user) {
      // Authentication successful
      res.redirect('admin')
    } else {
      // Authentication failed
      return res.send(
        "<script>" +
          "alert('Invalid username or password');" +
          "window.location.href = '/adminlogin';" +
          "</script>"
      );
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
app.get('/adminlogin', (req, res) => {
  res.render('adminlogin');
});

//<<------------------------------------------payment---------------------------------------->>
const paymentRoute = require('./routes/paymentRoute');

app.use('/',paymentRoute);
const planAmounts = {
  basic: 1500,
  premium: 4500,
  diamond: 9000,
};




app.get("/openpayment", function (req, res) {
  if (req.isAuthenticated()) {
    const plan = req.query.plan || ""; // Get the plan from the query parameter

  // Set the plan amount based on the selected plan or default to 0 if the plan is not recognized
  const planAmount = planAmounts[plan] || 0;

  res.render("payment-form", { planAmount ,plan}); // Pass planAmount to the template
  } else {
    res.redirect("/login");
  }
});



app.get('/success', (req, res) => {
  

  if (req.isAuthenticated()) {
    const { name, email, contact, planAmount,plan } = req.query;
    res.render('success', { name, email, contact, planAmount ,plan});
  } else {
    res.redirect("/login");
  }
   
});

app.post("/paymentdone", function (req, res) {
  // Extract the submitted data from the request body
  const { amount ,plan} = req.body;
// Create a new subscription record for the user
const subscription = {
  plan: plan,
  startDate: new Date(),
  endDate: calculateEndDate(plan),
};
  // Find the user by their ID (you might need to adjust this based on your user authentication method)
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
      // Handle the error (e.g., send an error response)
      return res.status(500).send("Internal Server Error");
    } else {
      if (foundUser) {
        // Update the user's `amount` field with the submitted amount
        foundUser.amount = amount;
        foundUser.plan = plan;
       foundUser.subscription= subscription;
        // Save the user's record
        foundUser.save(function (err) {
          if (err) {
            console.log(err);
            // Handle the error (e.g., send an error response)
            return res.status(500).send("Internal Server Error");
          }

          // Redirect to a relevant page after successfully updating the amount
          res.redirect("/account"); // Update this URL as needed
        });
      } else {
        // Handle the case where the user is not found (e.g., send a 404 response)
        res.status(404).send("User not found");
      }
    }
  });
});
///<<------------------------------------------------------------------>>

// Define a function to calculate subscription end date based on the selected plan
function calculateEndDate(plan) {
  const currentDate = new Date();
  let endDate = new Date();

  if (plan === "basic") {
    endDate.setMonth(currentDate.getMonth() + 1); // 1-month subscription
  } 
  // if (plan === "basic") {
  //   endDate.setMinutes(currentDate.getMinutes() + 2); // 2-minute subscription
  // }
  
  else if (plan === "premium") {
    endDate.setMonth(currentDate.getMonth() + 3); // 3-month subscription
  } else if (plan === "diamond") {
    endDate.setMonth(currentDate.getMonth() + 6); // 6-month subscription
  }

  return endDate;
}


// Define the checkSubscription middleware before using it
function checkSubscription(req, res, next) {
  const currentUser = req.user;

  if (currentUser && currentUser.subscription) {
    const currentDate = new Date();
    const endDate = new Date(currentUser.subscription.endDate);

    if (endDate >= currentDate) {
      // User has an active subscription, proceed
      return next();
    }
  }

  // User does not have an active subscription, restrict access
res.render("noaccessdash")
  
}   
app.get("/noaccessdash", function (req, res) {
  res.render("noaccessdash");
})

  

const cron = require('node-cron');

// Schedule the job to run every minute (adjust the schedule as needed)
cron.schedule('* * * * *', function () {
  // Find users whose subscription has ended
  User.find({ 'subscription.endDate': { $lte: new Date() } }, function (err, users) {
    if (err) {
      console.error(err);
      // Handle errors appropriately
      return;
    }

    // Update the 'plan' field to null for users with expired subscriptions
    users.forEach((user) => {
      user.plan = null;
      user.save(function (err) {
        if (err) {
          console.error(err);
          // Handle errors appropriately
        }
      });
    });  
  });
});

//-------------------------------------------------Program section-------------------------------------------------
app.get("/exercise", (req, res) => {
  res.render("exercise"); 
});

app.get("/yoga", (req, res) => {
  res.render("yoga"); 
});

app.get("/meditation", (req, res) => {
  res.render("meditation"); 
});

app.get("/weight", (req, res) => {
  res.render("weight"); 
});

app.get("/Trataka", (req, res) => {
  res.render("trataka"); 
});

app.get("/cardio", (req, res) => {
  res.render("cardio"); 
});

app.get("/pranayam", (req, res) => {
  res.render("pranayam"); 
});

app.get("/Laghu", (req, res) => {
  res.render("Laghu"); 
});

//--------------------------------------------------------------------------------------------------


// --------------------------------------------------

const ExcelJS = require('exceljs');
app.get('/export-to-excel', async (req, res) => {
  try {
    const users = await User.find({}); // Modify this query to fetch the data you need
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define the column headers
    worksheet.columns = [
      { header: 'Full Name', key: 'fullName' },
      { header: 'Date of Birth', key: 'dateOfBirth' },
      { header: 'Email', key: 'email' },
      { header: 'Mobile Number', key: 'mobileNumber' },
      { header: 'Gender', key: 'gender' },
      { header: 'Occupation', key: 'occupation' },
      { header: 'Address Type', key: 'addressType' },
      { header: 'Nationality', key: 'nationality' },
      { header: 'State', key: 'state' },
      { header: 'District', key: 'district' },
      { header: 'House Number', key: 'houseNumber' },
      { header: 'Pin Code', key: 'pinCode' },
      { header: 'Amount', key: 'amount' },
      { header: 'Plan', key: 'plan' },
      { header: 'Exercise Intensity', key: 'exerciseIntensity' },
      { header: 'Goal', key: 'goal' },
      { header: 'Food Habit', key: 'foodHabit' },
      { header: 'Physical Activity', key: 'physicalActivity' },
      { header: 'Medical History', key: 'medicalHistory' },
      { header: 'Current Medication', key: 'currentMedication' },
      { header: 'Health Issues', key: 'healthIssues' },
      { header: 'Expectation from Consultation', key: 'expectationFromConsultation' },
      { header: 'Measurements', key: 'measurements' },
      { header: 'Daily Workout', key: 'dailyWorkout' },
      { header: 'Workout Days Per Week', key: 'workoutDaysPerWeek' },
      { header: 'Exercise Contraindication', key: 'exerciseContraindication' },
      { header: 'Query', key: 'query' },
      { header: 'Subscription Plan', key: 'subscription.plan' },
      { header: 'Subscription Start Date', key: 'subscription.startDate' },
      { header: 'Subscription End Date', key: 'subscription.endDate' },
    ];

    // Format date fields before adding to the Excel sheet
    const formatDate = (date) => { 
      if (!date) return '';
      return date.toISOString().split('T')[0];
    };

    users.forEach((user) => {
      worksheet.addRow({
        fullName: user.fullName || user.displayName || user.username,
        dateOfBirth: formatDate(user.dateOfBirth),
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        occupation: user.occupation,
        addressType: user.addressType,
        nationality: user.nationality,
        state: user.state,
        district: user.district,
        houseNumber: user.houseNumber,
        pinCode: user.pinCode,
        amount: user.amount,
        plan: user.plan,
        exerciseIntensity: user.exerciseIntensity,
        goal: user.goal,
        foodHabit: user.foodHabit,
        physicalActivity: user.physicalActivity,
        medicalHistory: user.medicalHistory,
        currentMedication: user.currentMedication,
        healthIssues: user.healthIssues,
        expectationFromConsultation: user.expectationFromConsultation,
        measurements: user.measurements,
        dailyWorkout: user.dailyWorkout,
        workoutDaysPerWeek: user.workoutDaysPerWeek,
        exerciseContraindication: user.exerciseContraindication,
        query: user.query,
        'subscription.plan': user.subscription.plan,
        'subscription.startDate': formatDate(user.subscription.startDate),
        'subscription.endDate': formatDate(user.subscription.endDate),
      });
    });

    // Set headers for the Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

    // Write the Excel file to the response
    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      });
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    res.status(500).send('Internal Server Error');
  }
});
  