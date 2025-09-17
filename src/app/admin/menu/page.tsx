"use client";

import { useState, useEffect } from "react";
import { navbarAPI, MenuItem } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    path: "",
    new_tab: false,
    order: 0,
    published: true,
    parent_id: "",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await navbarAPI.getAllMenuItems(true);
      setMenuItems(items);
    } catch (error: any) {
      toast.error("Failed to fetch menu items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await navbarAPI.updateMenuItem(editingItem.id, formData);
        toast.success("Menu item updated successfully");
      } else {
        await navbarAPI.createMenuItem(formData);
        toast.success("Menu item created successfully");
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchMenuItems();
    } catch (error: any) {
      toast.error("Failed to save menu item: " + error.message);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      path: item.path || "",
      new_tab: item.new_tab,
      order: item.order,
      published: item.published,
      parent_id: item.parent_id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      await navbarAPI.deleteMenuItem(itemId);
      toast.success("Menu item deleted successfully");
      fetchMenuItems();
    } catch (error: any) {
      toast.error("Failed to delete menu item: " + error.message);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to perform bulk action");
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    try {
      await navbarAPI.bulkMenuAction(selectedItems, action);
      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(`Bulk ${action} failed: ` + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      path: "",
      new_tab: false,
      order: 0,
      published: true,
      parent_id: "",
    });
  };

  const getParentOptions = () => {
    return menuItems.filter(item => !item.parent_id);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => (
    <tr key={item.id} className={`border-b dark:border-gray-700`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems([...selectedItems, item.id]);
            } else {
              setSelectedItems(selectedItems.filter(id => id !== item.id));
            }
          }}
          className="w-4 h-4 text-blue-600"
        />
      </td>
      <td className="px-4 py-3">
        <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
          <span className="font-medium text-gray-900 dark:text-white">
            {item.title}
          </span>
          {level > 0 && <span className="ml-2 text-gray-500">↳</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {item.path || "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.published 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}>
          {item.published ? "Published" : "Unpublished"}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {item.order}
      </td>
      <td className="px-4 py-3 text-center">
        {item.new_tab ? "✓" : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Menu Management
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
            resetForm();
          }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
        >
          Add Menu Item
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.length} items selected
            </span>
            <button
              onClick={() => handleBulkAction('publish')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
            >
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(menuItems.flatMap(item => [item.id, ...item.children.map(child => child.id)]));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Tab
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {menuItems.map(item => [
              renderMenuItem(item, 0),
              ...item.children.map(child => renderMenuItem(child, 1))
            ]).flat()}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Path
                </label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="/about, /contact, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Menu
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Top Level</option>
                  {getParentOptions().map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.new_tab}
                    onChange={(e) => setFormData({ ...formData, new_tab: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Open in new tab
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Published
                  </span>
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md font-medium"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}