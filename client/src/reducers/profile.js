export default ( profile = "", action) => {
    switch(action.type){
        case "FETCH_PROFILE":
            return action.payload;
        case "SELECT_PROFILE":
            return action.payload;
        default:
            return profile;          
    }
}