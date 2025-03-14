import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchema = z.object({
    username:usernameValidation
})

export async function GET(request:Request) {

    await dbConnect()
    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        //validation with zod
        const result = UsernameQuerySchema.safeParse(queryParam)


        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success:false,
                message: usernameErrors?.length>0 ? usernameErrors.join(',') : 'Invalid query parameters',
            },{status:400})
        }

        const {username} = result.data

        const existingVerifiedUser = await UserModel.findOne({username,isVerified:true})

        if(existingVerifiedUser){
            return Response.json({
                success:false,
                message:"username is already taken"
            },{status:201})
        }
        else{
            return Response.json({
                success:true,
                message:"username is available"
            },{status:201})
        }

    } catch (error) {
        console.error("Error Checking username",error)
        return Response.json({
            success : false,
            message: "Error checking username"
        },{status : 500})
    }
}
