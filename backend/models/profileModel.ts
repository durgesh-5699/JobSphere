import { Document, mongoose, Schema } from 'mongoose';

interface IEducation {
    degree : string;
    institution:string;
    year:string;
}

interface IExperience{
    role:string;
    company:string;
    duration:string;
    description:string;
}

export interface IProfile extends Document{
    user : mongoose.Types.ObjectId;
    phone? :string;
    bio? :string;
    location?:string;
    education:IEducation[];
    experience:IExperience[];
    skills:string[];
    linkedin?:string;
    github?:string;
    portfolio?:string;
    resumeUrl?:string;
}

const educationSchema = new Schema<IEducation>({
    degree :{type:String ,required:true},
    institution:{type:String,required:true},
    year:{type:String,required:true},
    },
    {_id:false}
);

const experienceSchema = new Schema<IExperience>(
    {
        role:{type:String,required:true},
        company:{type:String,required:true},
        duration:{type:String,required:true},
        description:{type:String},
    },
    {_id:false}
)

const profileSchema = new Schema<IProfile>(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true,
        },
        phone:{type:String},
        bio:{type:String},
        location :{type:String},
        education: { type: [educationSchema], default: [] },
        experience: { type: [experienceSchema], default: [] },
        skills: { type: [String], default: [] },
        linkedin: { type: String },
        github: { type: String },
        portfolio: { type: String },
        resumeUrl: { type: String },
    },
    {timestamps:true}
);

const Profile = mongoose.model<IProfile>("Profile",profileSchema);
export default Profile;