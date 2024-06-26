const State = require('../model/State');
const fileData = require('../model/statesData.json');

// GET all
const getAllStates = async (req, res) => {
    
    // Retrieve data from file
    const fileStates = fileData;

    // Retrieve data from database
    const databaseData = await State.find();

    // Match states in file with states in database
    fileStates.forEach((fileState) => {
        const databaseState = databaseData.find((state) => state.stateCode == fileState.code);
        
        // If the state is in the database, store its funfacts in an array
        if (databaseState) {
            const factArray = databaseState.funfacts;

            // Append funfacts to the rest of the state facts
            if (factArray.length !== 0) {
                fileState.funfacts = [...factArray];
            }
        }
    });

    // Check for contig query
    const {contig} = req.query;

    // If contig is true, return 48 contiguous states
    if (contig === 'true') {
        let contigStates = [];
        fileData.forEach((state) => {
            if (state.code != "AK" && state.code != "HI") {
                contigStates.push(state);
            }
        });
        res.json(contigStates);
    }

    // If contig is false, return AK and HI
    else if (contig === 'false') {
        let nonContigStates = [];
        fileData.forEach((state) => {
            if (state.code == "AK" || state.code == "HI") {
                nonContigStates.push(state);
            }    
        });
        res.json(nonContigStates);
    }

    // If contig was not set, return all states
    else {
        res.json(fileStates);
    }
}

// POST
const createNewState = async (req, res) => {

    // Make sure funfacts were provided
    if (!req?.body?.funfacts) {
        return res.status(400).json({"message": "State fun facts value required"});
    }

    // Make sure funfacts value is an array
    const values = req.body.funfacts;

    if (!(values instanceof Array)) {
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }

    // Find state in database
    const state = await State.findOne({
        stateCode: req.code
    }).exec();

    // If the state doesn't exist in the database, create it
    if (!state) {
        const result = await State.create({
            stateCode: req.code,
            funfacts: req.body.funfacts
        });
   
        res.status(201).json(result);
    }

    // If there are already funfacts for the state, merge them with the new funfacts
    else {
        state.funfacts.push(...req.body.funfacts);
        const result = await state.save();
        res.status(201).json(result);
    }
}

// PATCH
const updateState = async (req, res) => {

    // Make sure index was provided
    if (!req?.body?.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    // Make sure funfact was provided
    if (!req?.body?.funfact) {
        return res.status(400).json({"message": "State fun fact value required"});
    }

    // Find state in database
    const state = await State.findOne({
        stateCode: req.code
    }).exec();

    let stateName;
    fileData.forEach((state) => {
        if (state.code == req.code) {
            stateName = state.state;
        }
    });

    // Make sure state has existing funfacts
    if (!state) {        
        return res.status(400).json({"message": `No Fun Facts found for ${stateName}`});
    }

    // Set index of funfact to be updated  
    const index = req.body.index;

    // If there are no funfacts at that index, return a message
    if (state.funfacts.length < (index - 1)) {
        return res.status(400).json({"message": `No Fun Fact found at that index for ${stateName}`});
    }

    // Update the funfact
    state.funfacts[index - 1] = req.body.funfact;

    // Save to database
    result = await state.save();
    res.status(201).json(result);
}

// DELETE
const deleteState = async (req, res) => {

    // Make sure index was provided
    if (!req?.body?.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    // Find state in database
    const state = await State.findOne({
        stateCode: req.code
    }).exec();

    let stateName;
    fileData.forEach((state) => {
        if (state.code == req.code) {
            stateName = state.state;
        }
    });

    // Make sure state has existing funfacts
    if (!state) {        
        return res.status(400).json({"message": `No Fun Facts found for ${stateName}`});
    }

    // Set index of funfact to be updated  
    const index = req.body.index;

    // If there are no funfacts at that index, return a message
    if (state.funfacts.length < (index - 1)) {
        return res.status(400).json({"message": `No Fun Fact found at that index for ${stateName}`});
    }

    // Find the funfact to be deleted using the index and remove it  
    state.funfacts.splice((index - 1), 1);

    // Save to database
    result = await state.save();
    res.json(result);
}

// GET single
const getState = async (req, res) => {

    // Make sure state is provided
    if (!req?.params?.state) return res.status(400).json({'message': 'State required.'});

    // Retrieve data from file
    const fileStates = fileData;

    // Retrieve data from database
    const databaseData = await State.find();

    // Match states in file with states in database
    fileStates.forEach((fileState) => {
        const databaseState = databaseData.find((state) => state.stateCode == fileState.code);

        // If the state is in the database, store its funfacts in an array
        if (databaseState) {
            const factArray = databaseState.funfacts;

            // Append funfacts to the rest of the state facts
            if (factArray.length !== 0) {
                fileState.funfacts = [...factArray];
            }
        }
    });

    // Find Parameter State
    let result;    
    fileStates.forEach((fileState) => {
        if (fileState.code === req.code) {
            result = fileState;
        }
    });
    res.json(result);
}

// Capital
const getStateCapital = async (req, res) => {
    
    // Find Parameter State in file data
    let paramState;   
    fileData.forEach((fileState) => {
        if (fileState.code === req.code) {
            paramState = fileState;
        }
    });

    // Create array with state name and capital
    const capitalArray = {
        state: paramState.state,
        capital: paramState.capital_city
    }
    res.json(capitalArray);
}

// Nickname
const getStateNickname = async (req, res) => {

    // Find Parameter State in file data
    let paramState;
    fileData.forEach((fileState) => {
        if (fileState.code === req.code) {
            paramState = fileState;
        }
    });

    // Create array with state name and nickname
    const nicknameArray = {
        state: paramState.state,
        nickname: paramState.nickname
    }
    res.json(nicknameArray);
}

// Population
const getStatePopulation = async (req, res) => {

    // Find Parameter State in file data
    let paramState;    
    fileData.forEach((fileState) => {
        if (fileState.code === req.code) {
            paramState = fileState;
        }
    });

    // Format number
    const population = new Intl.NumberFormat("en-US").format(paramState.population);

    // Create array with state name and population
    const populationArray = {
        state: paramState.state,
        population: population
    }
    res.json(populationArray);
}

// Admission
const getStateAdmission = async (req, res) => {

    // Find Parameter State in file data
    let paramState;    
    fileData.forEach((fileState) => {
        if (fileState.code === req.code) {
            paramState = fileState;
        }
    });

    // Create array with state name and admission date
    const admissionArray = {
        state: paramState.state,
        admitted: paramState.admission_date
    }
    res.json(admissionArray);
}

// Random Fun Fact
const getRandomStateFunfact = async (req, res) => {

    // Retrieve data from MongoDB
    const databaseData = await State.find();

    // Find Parameter State in database
    let paramState;    
    databaseData.forEach((state) => {
        if (state.stateCode === req.code) {
            paramState = state;
        }
    });    

    // If there are no funfacts, return a message
    if (!paramState) {
        let stateName;
        fileData.forEach((state) => {
            if (state.code == req.code) {
                stateName = state.state;
            }
        });

        const message = {
            message: `No Fun Facts found for ${stateName}`
        }
        res.json(message);
    }

    // Otherwise, return a random funfact
    else {
        // Store funfacts in an array
        const funfactsArray = paramState.funfacts;

        const randomFact = funfactsArray[Math.floor(Math.random() * funfactsArray.length)];

        // Create a funfact array
        const result = {
            funfact: randomFact
        }    
        res.json(result);    
    }
}

module.exports = {
    getAllStates,
    createNewState,
    updateState,
    deleteState, 
    getState,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission,
    getRandomStateFunfact
}