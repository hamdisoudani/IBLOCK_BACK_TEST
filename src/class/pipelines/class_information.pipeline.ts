import mongoose from "mongoose";

export const fetchClassInformationPipeline =  (classId: string) => {
   const pipeline =  [
    { $match: { _id: new mongoose.Types.ObjectId(classId) } },
    { 
        $lookup: { 
            from: 'schools', 
            localField: 'schoolId', 
            foreignField: '_id', 
            as: 'school' , 
            pipeline: [{
                $project: {
                    _id: 1,
                    schoolName: 1,
                    invitationCode: 1
                }
            }]
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
            pipeline: [{
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1
                }
            }]
        }
    },
    { 
        $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'owner',
            pipeline: [{
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1
                }
            }]
        }
    },
    { $unwind: '$owner' },
    { $unwind: '$school' }, 
    { $unwind: '$members' },
    {
        $project: {
            className: 1,
            school: 1,
            members: 1,
            owner: 1
        }
    }
    ]
    return pipeline
}