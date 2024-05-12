import { Types } from "mongoose"
import { ProjectDocument } from "src/projects/schemas/project.schema"
import { schoolDocument } from "src/school/schemas/school.schema"
import { Role, usersDocument } from "src/users/schemas/users.schema"

export interface ClassDetailsResponse {
    classId: Types.ObjectId,
    className: string,
    school: schoolDocument,
    members: usersDocument[],
    projects: Array<ProjectDocument>
}