import { PrismaService } from '../../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        ok: boolean;
    }>;
    getSessionUser(accessToken: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.RoleCode;
        familyId: string | null | undefined;
        assignedCaseIds: string[];
    }>;
    hashToken(token: string): string;
}
