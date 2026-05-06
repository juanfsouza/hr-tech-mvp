import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateCollaboratorsDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cpf!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    role!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    managerId!: string;

}