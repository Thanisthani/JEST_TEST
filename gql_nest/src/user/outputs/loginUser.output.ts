import {
    Field,
    ObjectType
} from '@nestjs/graphql';

@ObjectType()
    
export class LoggedInUserOutput {
    
    @Field({nullable:true})
    accessToken: string;

}