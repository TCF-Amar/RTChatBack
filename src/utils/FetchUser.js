import User from "../models/user.model.js"

const fetchUser = async (userId = null, username = null) => {
    const matchCondition = {};
    if (userId) {
        matchCondition._id = userId;
    } else if (username) {
        matchCondition.username = username;
    } else {
        return null; // Or throw an error if an identifier is always required
    }
    const user = await User.aggregate([
        {
            $match: matchCondition
        },
        {
            $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1,
                photoURL: 1,
                coverPhotoURL: 1,

            }
        }
    ])


    return user.length > 0 ? user[0] : null;
}

export { fetchUser }