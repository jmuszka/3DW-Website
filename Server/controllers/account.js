const {addDBCredentials, queryDBCredentials, generateRefreshToken, generateAccessToken} = require('../helpers/auth.js');

// Create a new user in the database
// - TODO: are we going to assure email uniqueness?
const register = async(req, res) => {
    const{studentNumber, email, password, name} = req.body;

    // Check if all required fields have been sent
    if (!studentNumber || !email || !password || !name || !name.first || !name.last) {
        res.status(400).json({message: "Need a student number, student email, and password in order to create new account"})
        return
    }

    // Validate credentials:
    // Student number is 9 digit number beginning with 251
    if (typeof studentNumber !== 'number' || studentNumber < 251000000 || studentNumber > 251999999) {
        res.status(400).json({message: "Invalid student number"})
        return
    }
    // Email is of format [name][optional numbers]@uwo.ca
    if (!email.match(/^[a-z]+[0-9]*@uwo.ca$/)) {
        res.status(400).json({message: "Invalid student email format"})
        return
    }

    // Add user information to database
    await addDBCredentials(studentNumber, email, password, name.first, name.last, 'users')
    .then((success) => {
        // Check if user was successfully added to database or not
        if (success) { 
            // Generate access and refresh tokens
            const accessToken = generateAccessToken(studentNumber);
            const refreshToken = generateRefreshToken(studentNumber);

            res.cookie('refreshToken', refreshToken, { //The name of the token should be sent under 'refreshToken' in the frontend
                httpOnly: true,
                sameSite: 'None', 
                secure: true, 
                maxAge: 1000 * 60 * 60 * 24 * 3 // 1000 ms x 60 s * 60 m * 24 hr * 3d
            });

            // Return response
            res.status(200).json({message: "User added to database", accessToken})
        }
            else res.status(400).json({message: `User with same student number and/or email already exists`})
    })
    .catch((error) => { res.status(500).json({message: `Server Error: ${error}`}) })
}

const login = async(req, res) => {
    const {studentNumber, password} = req.body;

    // Check if credentials have been provided
    if (!password || !studentNumber)
        res.status(400).json({message: "Missing credentials"})

    // Check if database has mathcing student number and password [hash]
    await queryDBCredentials(studentNumber, password, 'users')
    .then((successful) => {
        // If credentials were successful or not
        if (successful) {
            // Generate access and refresh tokens
            const accessToken = generateAccessToken(studentNumber);
            const refreshToken = generateRefreshToken(studentNumber);

            res.cookie('refreshToken', refreshToken, { //The name of the token should be sent under 'refreshToken' in the frontend
                httpOnly: true,
                sameSite: 'None', 
                secure: true, 
                maxAge: 1000 * 60 * 60 * 24 * 3 // 1000 ms x 60 s * 60 m * 24 hr * 3d
            });

            // Returning response
            res.status(200).json({message: "Logging in", accessToken})
        }
        else {
            res.status(400).json({message: "Username or password incorrect"})
        }
    })
    .catch((error) => { res.status(500).json({message: `Server Error: ${error}`}) })


}

const logout = async(req, res) => {
    const{inputInfo} = req.body;
    try{
        //console.log(inputInfo);
        //res.status(200).json({ message: "Hello World!" });
    } catch (error) {
        //res.status(500).json({ message: `Internal Server Error: ${error.message}`})
    }
}

module.exports = {
    register,
    login,
    logout
}