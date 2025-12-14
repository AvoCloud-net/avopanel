<?php

namespace Everest\Tests\Integration\Models;

use Everest\Models\Server;
use Everest\Models\Billing\Product;
use Everest\Tests\Integration\IntegrationTestCase;
use Everest\Exceptions\Model\DataValidationException;

class ServerValidationTest extends IntegrationTestCase
{
    /**
     * Test that updating a server with an orphaned billing_product_id
     * (where the product no longer exists) doesn't fail validation
     * when the billing_product_id field is not being changed.
     */
    public function testServerCanBeUpdatedWithOrphanedBillingProductId(): void
    {
        // Create a server with a valid billing product
        $server = $this->createServerModel(['billing_product_id' => 999]);
        
        // Simulate the product being deleted by setting a non-existent ID
        // The server is already persisted with this ID
        
        // Now try to update the server's name (not changing billing_product_id)
        $server->name = 'Updated Server Name';
        
        // This should not throw a DataValidationException
        $server->saveOrFail();
        
        $this->assertEquals('Updated Server Name', $server->fresh()->name);
        $this->assertEquals(999, $server->fresh()->billing_product_id);
    }

    /**
     * Test that changing the billing_product_id to a non-existent value
     * still validates properly.
     */
    public function testServerValidatesNewBillingProductIdExists(): void
    {
        $server = $this->createServerModel(['billing_product_id' => null]);
        
        // Try to set a non-existent billing_product_id
        $server->billing_product_id = 99999;
        
        $this->expectException(DataValidationException::class);
        $server->saveOrFail();
    }

    /**
     * Test that setting billing_product_id to null works fine.
     */
    public function testServerCanHaveNullBillingProductId(): void
    {
        $server = $this->createServerModel(['billing_product_id' => 999]);
        
        // Set billing_product_id to null
        $server->billing_product_id = null;
        $server->saveOrFail();
        
        $this->assertNull($server->fresh()->billing_product_id);
    }
}
