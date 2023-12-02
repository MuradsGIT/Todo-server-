const mongoose = require('mongoose'); 
  
const TodoModel = new mongoose.Schema({ 
    
    todo: { 
        type: String, 
    }, 
    status: { 
        type: Boolean, 
    }, 
  
}); 
  
  

  
module.exports = mongoose.model("todos", TodoModel); 