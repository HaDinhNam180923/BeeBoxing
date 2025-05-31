<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SlideController extends Controller
{
    /**
     * Display a listing of the slides.
     *
     * @return \Illuminate\Http\Response
     */
    public function getSlides()
    {
        $slides = Slide::where('is_active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json($slides);
    }

    /**
     * Store a newly created slide in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'link_url' => 'nullable|url',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public/slide', $imageName);

            $slide = new Slide();
            $slide->title = $request->title;
            $slide->description = $request->description;
            $slide->image_url = '/storage/slide/' . $imageName;
            $slide->link_url = $request->link_url;
            $slide->is_active = $request->has('is_active') ? $request->is_active : true;
            $slide->display_order = $request->display_order ?? 0;
            $slide->save();

            return response()->json(['message' => 'Slide created successfully', 'slide' => $slide], 201);
        }

        return response()->json(['error' => 'Image upload failed'], 500);
    }

    /**
     * Display the specified slide.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $slide = Slide::find($id);

        if (!$slide) {
            return response()->json(['error' => 'Slide not found'], 404);
        }

        return response()->json($slide);
    }

    /**
     * Update the specified slide in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $slide = Slide::find($id);

        if (!$slide) {
            return response()->json(['error' => 'Slide not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'link_url' => 'nullable|url',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            // Remove old image
            if ($slide->image_url) {
                $oldPath = str_replace('/storage/', 'public/', $slide->image_url);
                if (Storage::exists($oldPath)) {
                    Storage::delete($oldPath);
                }
            }

            // Upload new image
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public/slide', $imageName);
            $slide->image_url = '/storage/slide/' . $imageName;
        }

        $slide->title = $request->title ?? $slide->title;
        $slide->description = $request->description ?? $slide->description;
        $slide->link_url = $request->link_url ?? $slide->link_url;

        if ($request->has('is_active')) {
            $slide->is_active = $request->is_active;
        }

        if ($request->has('display_order')) {
            $slide->display_order = $request->display_order;
        }

        $slide->save();

        return response()->json(['message' => 'Slide updated successfully', 'slide' => $slide]);
    }

    /**
     * Remove the specified slide from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $slide = Slide::find($id);

        if (!$slide) {
            return response()->json(['error' => 'Slide not found'], 404);
        }

        // Remove image from storage
        if ($slide->image_url) {
            $path = str_replace('/storage/', 'public/', $slide->image_url);
            if (Storage::exists($path)) {
                Storage::delete($path);
            }
        }

        $slide->delete();

        return response()->json(['message' => 'Slide deleted successfully']);
    }
}
