import { Types } from "mongoose";
import { ProjectType } from "src/projects/schemas/project.schema";

export const getAllChildProjectsForStudent = (studentId: Types.ObjectId, schoolId: Types.ObjectId) => {
    return [
        {
            $match: {
                members: studentId,
                schoolId: schoolId,
                projectType: ProjectType.META_PROJECT
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'projectOwner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            role: 1
                        }
                    }
                ]
            }
        },
        { $unwind: '$owner' },
        {
            $project: {
                projectName: 1,
                projectDescription: 1,
                collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"} },
                createdAt: 1,
                owner: 1,
                numberOfMembers: { $size: '$members' }
            }
        }
    ]
}