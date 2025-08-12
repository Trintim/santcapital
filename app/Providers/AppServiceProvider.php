<?php

declare(strict_types = 1);

namespace App\Providers;

use App\Enums\Auth\Can;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configModels();
        $this->configUrls();
        $this->configDate();
        $this->configGates();
    }

    /**
     * Configure Eloquent models.
     * This includes setting the guard, strict mode, and lazy loading prevention.
     */
    private function configModels(): void
    {
        Model::unguard();

        Model::shouldBeStrict();

        Model::preventLazyLoading(
            ! app()->isProduction()
        );
    }

    /*
     * Force HTTPS URLs in production.
     * This is useful for applications that are served over HTTPS.
     */
    private function configUrls(): void
    {
        URL::forceHttps();
    }

    /**
     * Use CarbonImmutable for date handling.
     * This ensures that dates are immutable, which is a good practice.
     */
    private function configDate(): void
    {
        Date::use(CarbonImmutable::class);
    }

    /**
     * Configure gates for authorization.
     * This is where you can define your application's authorization logic.
     */
    private function configGates(): void
    {
        foreach (Can::cases() as $permission) {
            Gate::define(
                $permission->value,
                fn (User $user) => $user
                    ->permissions()
                    ->where('name', $permission->name)
                    ->exists()
            );
        }
    }
}
