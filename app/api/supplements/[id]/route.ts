// PUT /api/supplements/[id] - Update supplement
// DELETE /api/supplements/[id] - Delete supplement

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateSupplementDefinitionInput } from '@/lib/types/supplement';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSupplementDefinitionInput = await request.json();

    // Update supplement
    const { data: supplement, error } = await supabase
      .from('supplement_definition')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplement:', error);
      return NextResponse.json(
        { error: 'Failed to update supplement' },
        { status: 500 }
      );
    }

    if (!supplement) {
      return NextResponse.json(
        { error: 'Supplement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ supplement });
  } catch (error) {
    console.error('Error in supplement PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete supplement (logs will be cascade deleted)
    const { error } = await supabase
      .from('supplement_definition')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting supplement:', error);
      return NextResponse.json(
        { error: 'Failed to delete supplement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in supplement DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

