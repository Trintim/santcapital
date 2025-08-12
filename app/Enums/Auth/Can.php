<?php

declare(strict_types = 1);

namespace App\Enums\Auth;

use App\Enums\HasCollect;

enum Can: string
{
    use HasCollect;
    case ViewDashboard = 'view-dashboard';

    case ManageUsers = 'manage-users';

    case ManageRoles = 'manage-roles';

    case ManagePermissions = 'manage-permissions';

    case ViewReports = 'view-reports';

    case ManageSettings = 'manage-settings';

    case ViewProfile = 'view-profile';

    case EditProfile = 'edit-profile';
}
