export interface CreateUserDto
{
    username: string
    password: string
    email: string
}

export interface SaveRefreshTokenDto
{
    refreshToken: string,
    userID: string
}