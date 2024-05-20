import { Types } from "mongoose"

export const getAllOwndedMetaProjectsByTeacher = (teacherId: string, schoolId: Types.ObjectId) => {
  return [
    {
      $match: {
        createdBy: new Types.ObjectId(teacherId),
        schoolId: schoolId
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'members',
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
    {
        $lookup: {
            from: 'metaprojectcodes',
            localField: 'projectCodes',
            foreignField: '_id',
            as: 'projectCodes',
        }
    },
    {
        $project: {
            projectName: 1,
            projectDescription: 1,
            members: 1,
            numberOfCollaborativeInvitationCodes: { $cond: { if: { $isArray: "$projectCodes" }, then: { $size: "$projectCodes" }, else: "0"} },
            collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"} },
            invitationCode: 1,
            createdAt: 1
        }
    }
  ]
}

export const getAllJoinedMetaProjectsByStudent = (studentId: string, schoolId: Types.ObjectId) => {
    return [
        {
        $match: {
            members: new Types.ObjectId(studentId),
            schoolId: schoolId
        }
        },
        {
        $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
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
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
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
                members: 1,
                collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"} },
                owner: 1,
                createdAt: 1
            }
        }
    ]
}