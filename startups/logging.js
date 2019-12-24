module.exports = function() {
  
  process.on('unhandledRejection', (ex) => {
    console.log(ex);
    process.exit(1);
   });
 
   process.on('uncaughtException', (err) => {
     console.log(err);
     process.exit(1);
   });

};