import {
    Field,
    ObjectType
} from '@nestjs/graphql';

@ObjectType()
    
export class ProtectRouteOutput {
    
    @Field({nullable:true})
    username: string;

}