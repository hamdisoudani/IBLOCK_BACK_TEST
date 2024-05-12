export const getAllBlocksPipeline = [
    {
        $lookup: {
            from: 'users',
            localField: 'createdBy',
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
    {
        $lookup: {
            from: 'blockscategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category'
        }
    },
    {
        $project: {
            name: 1,
            owner: 1,
            createdAt: 1,
            updatedAt: 1,
            category: {
                $cond: {
                    if: { $eq: ["$categoryId", null] },
                    then: "Uncategorized",
                    else: { $arrayElemAt: ["$category.name", 0] }
                }
            }
        }
    }
];
