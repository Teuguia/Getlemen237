<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isStaff()) {
            return redirect()
                ->route('collections.index')
                ->with('success', 'Vous etes connecte comme client.');
        }

        return $next($request);
    }
}
