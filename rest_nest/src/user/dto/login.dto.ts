import {
    IsString
} from 'class-validator'

export class logindto {

    @IsString()
    email: string;

    @IsString()
    password: string;
    
}