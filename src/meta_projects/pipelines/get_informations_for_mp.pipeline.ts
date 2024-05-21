import e from "express";
import { Types } from "mongoose";

/**
 * We want to get all the information for a Meta Project in case of the user is the owner of the Meta Project (Teacher)
 * @param mpID // Meta Project ID
 * @returns pipeline // Array of stages for the aggregation pipeline
 */
export const getAllInformationsForMpPipeline = (mpID: string) => {
    const pipeline =  [
        {
            $match: {
                _id: new Types.ObjectId(mpID)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
                pipeline: [{
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        role: 1
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
                        role: 1,
                        email: 1
                    }
                }]
            }
        },
        {
            $lookup: {
                from: 'metaprojectcodes',
                localField: 'projectCodes',
                foreignField: '_id',
                as: 'projectCodes',
                pipeline: [{
                    $lookup: {
                        from: 'users',
                        localField: 'members',
                        foreignField: '_id',
                        as: 'members',
                        pipeline: [{
                            $project: {
                                _id: 1,
                                name: 1,
                                role: 1,
                                email: 1
                            }
                        }]
                    }
                }, {
                    $project: {
                        _id: 1,
                        code: 1,
                        members: 1,
                        childProjectName: 1,
                        childProjectDescription: 1,
                        createdAt: 1,
                        numberOfMembers: { $size: "$members" }
                    }
                }]
            }
        },
        {
            $lookup: {
                from: 'schools',
                localField: 'schoolId',
                foreignField: '_id',
                as: 'school',
                pipeline: [{
                    $project: {
                        _id: 1,
                        schoolName: 1,
                    }
                }]
            }
        },
        { $unwind: '$createdBy' },
        { $unwind: '$school' },
        {
            $project: {
                _id: 1,
                projectName: 1,
                projectDescription: 1,
                createdBy: 1,
                members: 1,
                projectCodes: 1,
                school: 1,
                collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"}   },
                createdAt: 1,
                invitationCode: 1
            }
        }
    ];

    return pipeline;
}

export const getGeneralInformationsForMpPipeline = (mpID: string) => {
    const pipeline =  [
        {
            $match: {
                _id: new Types.ObjectId(mpID)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
                pipeline: [{
                    $project: {
                        _id: 1,
                        name: 1,
                        role: 1,
                        email: 1
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
                        role: 1,
                        email: 1
                    }
                }]
            }
        },
        { $unwind: '$createdBy' },
        {
            $project: {
                _id: 1,
                projectName: 1,
                projectDescription: 1,
                createdBy: 1,
                members: 1,
                collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"}   },
                createdAt: 1
            }
        }
    ];

    return pipeline;
};