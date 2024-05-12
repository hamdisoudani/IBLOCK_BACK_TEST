import mongoose, { Types } from "mongoose";

export const getEnrolledClassesBySchool = (schoolId: Types.ObjectId, userId: string) => {
    const pipeline = [
        {
            $match: { schoolId: new Types.ObjectId(schoolId) }
        },
        // Match classes where the user is a member
        {
        $match: { members: new Types.ObjectId(userId) }
        },
    ];

    return pipeline;
};